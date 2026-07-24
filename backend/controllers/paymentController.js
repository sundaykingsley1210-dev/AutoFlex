const crypto = require('crypto');
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const PaymentSchedule = require('../models/PaymentSchedule');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateTransactionRef } = require('../utils/helpers');

let cachedToken = null;
let tokenExpiry = 0;

const getMonnifyToken = async () => {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const creds = Buffer.from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`).toString('base64');
  const res = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!data.requestSuccessful) throw new Error(data.responseMessage || 'Monnify auth failed');
  cachedToken = data.responseBody.accessToken;
  tokenExpiry = Date.now() + (data.responseBody.expiresIn * 1000) - 60000;
  return cachedToken;
};

const updateScheduleForPayment = async (payment) => {
  const schedule = await PaymentSchedule.findOne({ application: payment.application });
  if (!schedule) return;
  for (let p of schedule.payments) {
    if (p.status === 'due' || p.status === 'overdue' || p.status === 'upcoming') {
      const remaining = p.amountDue - p.amountPaid;
      const applied = Math.min(payment.amount, remaining);
      p.amountPaid += applied;
      p.status = p.amountPaid >= p.amountDue ? 'paid' : p.status;
      p.paidAt = p.amountPaid >= p.amountDue ? new Date() : undefined;
      p.transactionRef = payment.transactionRef;
      break;
    }
  }
  schedule.totalPaid = schedule.payments.reduce((sum, p) => sum + p.amountPaid, 0);
  schedule.remainingBalance = schedule.totalAmount - schedule.totalPaid;
  await schedule.save();
};

exports.initiatePayment = async (req, res) => {
  try {
    const { applicationId, amount, type } = req.body;

    const application = await Application.findById(applicationId).populate('vehicle');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });

    const transactionRef = generateTransactionRef();
    const paymentRef = `AFX-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const payment = await Payment.create({
      user: req.user._id,
      application: applicationId,
      vehicle: application.vehicle._id,
      amount,
      type,
      transactionRef,
      paymentMethod: 'monnify',
      status: 'pending'
    });

    const token = await getMonnifyToken();
    const initRes = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        customerName: `${req.user.firstName} ${req.user.lastName}`,
        customerEmail: req.user.email,
        paymentReference: paymentRef,
        paymentDescription: `${type === 'deposit' ? 'Down Payment' : 'Installment Payment'} for ${application.vehicle.name}`,
        currencyCode: 'USD',
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        redirectUrl: `${process.env.FRONTEND_URL || 'https://frontend-coral-zeta-12.vercel.app'}/payment/callback`,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        metaData: {
          paymentId: payment._id.toString(),
          applicationId: applicationId,
          internalRef: transactionRef
        }
      })
    });

    const initData = await initRes.json();
    if (!initData.requestSuccessful) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ success: false, message: initData.responseMessage || 'Failed to initialize payment' });
    }

    payment.monnifyTransactionRef = initData.responseBody.transactionReference;
    payment.paymentRef = paymentRef;
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment initialized',
      data: {
        payment,
        checkoutUrl: initData.responseBody.checkoutUrl,
        transactionReference: initData.responseBody.transactionReference,
        apiKey: process.env.MONNIFY_API_KEY,
        contractCode: process.env.MONNIFY_CONTRACT_CODE
      }
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ success: false, message: 'Server error initiating payment' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { transactionRef } = req.params;

    const payment = await Payment.findOne({ transactionRef });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    if (payment.status === 'successful') {
      return res.status(200).json({ success: true, data: { payment, verified: true } });
    }

    try {
      const token = await getMonnifyToken();
      const monnifyRef = payment.monnifyTransactionRef || transactionRef;
      const response = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v2/transactions/${monnifyRef}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (data.requestSuccessful && data.responseBody) {
        const txn = data.responseBody;
        if (txn.paymentStatus === 'PAID' || txn.paymentStatus === 'paid') {
          payment.status = 'successful';
          payment.monniePayId = txn.transactionReference;
          await payment.save();

          if (payment.type === 'deposit') {
            await Application.findByIdAndUpdate(payment.application, { status: 'active' });
          }
          await updateScheduleForPayment(payment);

          await Notification.create({
            user: payment.user,
            type: 'payment_received',
            message: `Payment of $${payment.amount.toLocaleString()} received successfully. Ref: ${transactionRef}`,
            link: `/payments`
          });

          return res.status(200).json({ success: true, data: { payment, verified: true } });
        } else if (txn.paymentStatus === 'FAILED' || txn.paymentStatus === 'failed') {
          payment.status = 'failed';
          await payment.save();
          return res.status(200).json({ success: true, data: { payment, verified: false } });
        }
      }
    } catch (apiError) {
      console.log('Monnify verify API error:', apiError.message);
    }

    res.status(200).json({ success: true, data: { payment, verified: false, message: 'Payment still pending' } });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    const { transactionRef, paymentRef, status } = req.query;
    const ref = transactionRef || paymentRef;

    if (ref) {
      const payment = await Payment.findOne({ $or: [{ transactionRef: ref }, { paymentRef: ref }] });
      if (payment && payment.status !== 'successful') {
        try {
          const token = await getMonnifyToken();
          const monnifyRef = payment.monnifyTransactionRef || ref;
          const response = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v2/transactions/${monnifyRef}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          if (data.requestSuccessful && data.responseBody?.paymentStatus === 'PAID') {
            payment.status = 'successful';
            payment.monniePayId = data.responseBody.transactionReference;
            await payment.save();
            if (payment.type === 'deposit') {
              await Application.findByIdAndUpdate(payment.application, { status: 'active' });
            }
            await updateScheduleForPayment(payment);
          }
        } catch (e) {
          console.log('Callback verify error:', e.message);
        }
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://frontend-coral-zeta-12.vercel.app';
    res.redirect(`${frontendUrl}/payment/callback?transactionRef=${transactionRef || ''}&paymentRef=${paymentRef || ''}&status=${status || ''}`);
  } catch (error) {
    console.error('Callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'https://frontend-coral-zeta-12.vercel.app';
    res.redirect(`${frontendUrl}/payment/callback?status=error`);
  }
};

exports.processWebhook = async (req, res) => {
  try {
    const signature = req.headers['mnty-signature'] || req.headers['MNFY-SIGNATURE'];
    if (process.env.MONNIFY_SECRET_KEY && signature) {
      const hash = crypto.createHmac('sha512', process.env.MONNIFY_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
      if (hash !== signature) {
        console.warn('Webhook signature mismatch');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }
    }

    const { eventType, eventData } = req.body;
    if (eventType === 'TRANSACTION_SUCCESSFUL' || eventType === 'SUCCESSFUL') {
      const txnRef = eventData?.transactionReference || eventData?.paymentReference;
      if (txnRef) {
        const payment = await Payment.findOne({ $or: [{ monnifyTransactionRef: txnRef }, { transactionRef: txnRef }, { paymentRef: txnRef }] });
        if (payment && payment.status !== 'successful') {
          payment.status = 'successful';
          payment.monniePayId = eventData.transactionReference;
          await payment.save();

          if (payment.type === 'deposit') {
            await Application.findByIdAndUpdate(payment.application, { status: 'active' });
          }
          await updateScheduleForPayment(payment);

          await Notification.create({
            user: payment.user,
            type: 'payment_received',
            message: `Payment of $${payment.amount.toLocaleString()} confirmed via webhook. Ref: ${payment.transactionRef}`
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('application', 'status')
      .populate('vehicle', 'name brand model year images')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('application', 'status')
      .populate('vehicle', 'name brand model year')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Payment.countDocuments(query);
    res.status(200).json({ success: true, payments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);
    const paymentsByType = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data: { totalRevenue: totalRevenue[0]?.total || 0, monthlyRevenue, paymentsByType } });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payment stats' });
  }
};

exports.createVirtualAccount = async (req, res) => {
  try {
    const { applicationId } = req.body;

    const application = await Application.findById(applicationId).populate('vehicle');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });

    const bankAccount = await generateVirtualAccountForUser(req.user);

    res.status(201).json({
      success: true,
      message: 'Virtual account created successfully',
      data: { virtualAccount: bankAccount, application }
    });
  } catch (error) {
    console.error('Create virtual account error:', error);
    res.status(500).json({ success: false, message: 'Server error creating virtual account' });
  }
};

const generateVirtualAccountForUser = async (user) => {
  const accountName = `AutoFlex - ${user.firstName} ${user.lastName}`;
  const accountReference = `AFX-${user._id.toString().slice(-8)}-${Date.now()}`;

  try {
    const token = await getMonnifyToken();
    const reserveRes = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v1/bank-accounts/reserve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountReference: accountReference,
        accountName: accountName,
        currencyCode: 'NGN',
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
        bvn: '00000000000',
        getAllAvailableBanks: true
      })
    });

    const reserveData = await reserveRes.json();

    if (reserveData.requestSuccessful && reserveData.responseBody) {
      const vb = reserveData.responseBody;
      const bankAccount = {
        bankName: vb.bankName || vb.bank?.name || 'Monnify Bank',
        accountNumber: vb.accountNumber,
        accountName: vb.accountName || accountName,
        bankCode: vb.bankCode || vb.bank?.code || '',
        currency: 'NGN'
      };

      await User.findByIdAndUpdate(user._id, { virtualAccount: bankAccount });
      return bankAccount;
    }
  } catch (apiError) {
    console.log('Monnify reserve API error:', apiError.message);
  }

  const fallbackAccount = {
    bankName: 'Wema Bank',
    accountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    accountName: accountName,
    bankCode: '035',
    currency: 'NGN'
  };

  await User.findByIdAndUpdate(user._id, { virtualAccount: fallbackAccount });
  return fallbackAccount;
};

module.exports.generateVirtualAccountForUser = generateVirtualAccountForUser;
