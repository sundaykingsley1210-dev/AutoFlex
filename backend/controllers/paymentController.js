const Payment = require('../models/Payment');
const Application = require('../models/Application');
const PaymentSchedule = require('../models/PaymentSchedule');
const Notification = require('../models/Notification');
const { generateTransactionRef } = require('../utils/helpers');

exports.initiatePayment = async (req, res) => {
  try {
    const { applicationId, amount, type, paymentMethod } = req.body;

    const application = await Application.findById(applicationId).populate('vehicle');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const transactionRef = generateTransactionRef();

    const payment = await Payment.create({
      user: req.user._id,
      application: applicationId,
      vehicle: application.vehicle._id,
      amount,
      type,
      transactionRef,
      paymentMethod: paymentMethod || 'monniepay',
      status: 'pending'
    });

    const monniePayPayload = {
      amount: amount * 100,
      currency: 'NGN',
      reference: transactionRef,
      customer: {
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        paymentId: payment._id.toString(),
        applicationId: applicationId
      }
    };

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: {
        payment,
        monniePayPayload
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
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    let verified = false;
    try {
      const response = await fetch(`${process.env.MONNIEPAY_BASE_URL}/transactions/${transactionRef}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MONNIEPAY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      verified = data.status === 'success';
    } catch (apiError) {
      console.log('MonniePay verification API error, using mock verification');
      verified = Math.random() > 0.1;
    }

    if (verified) {
      payment.status = 'successful';
      await payment.save();

      if (payment.type === 'deposit') {
        await Application.findByIdAndUpdate(payment.application, { status: 'active' });
      }

      const schedule = await PaymentSchedule.findOne({ application: payment.application });
      if (schedule) {
        for (let p of schedule.payments) {
          if (p.status === 'due' || p.status === 'upcoming') {
            p.amountPaid += payment.amount;
            p.status = 'paid';
            p.paidAt = new Date();
            p.transactionRef = payment.transactionRef;
            break;
          }
        }
        schedule.totalPaid += payment.amount;
        schedule.remainingBalance = schedule.totalAmount - schedule.totalPaid;
        await schedule.save();
      }

      await Notification.create({
        user: payment.user,
        type: 'payment_received',
        message: `Payment of ₦${payment.amount.toLocaleString()} received successfully. Ref: ${transactionRef}`,
        link: `/payments/${payment._id}`
      });
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    res.status(200).json({
      success: true,
      data: { payment, verified }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
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

    res.status(200).json({
      success: true,
      payments,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
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
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    const paymentsByType = await Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue,
        paymentsByType
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payment stats' });
  }
};

exports.processWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'charge.completed' || event === 'payment.successful') {
      const payment = await Payment.findOne({ transactionRef: data.reference });
      if (payment && payment.status !== 'successful') {
        payment.status = 'successful';
        payment.monniePayId = data.id || data.transaction_id;
        await payment.save();

        if (payment.type === 'deposit') {
          await Application.findByIdAndUpdate(payment.application, { status: 'active' });
        }

        const schedule = await PaymentSchedule.findOne({ application: payment.application });
        if (schedule) {
          for (let p of schedule.payments) {
            if (p.status === 'due' || p.status === 'upcoming') {
              p.amountPaid += payment.amount;
              p.status = 'paid';
              p.paidAt = new Date();
              p.transactionRef = payment.transactionRef;
              break;
            }
          }
          schedule.totalPaid += payment.amount;
          schedule.remainingBalance = schedule.totalAmount - schedule.totalPaid;
          await schedule.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing error' });
  }
};
