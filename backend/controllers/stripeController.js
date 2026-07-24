const Stripe = require('stripe');
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

let stripeInstance = null;

const getStripe = () => {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

exports.getStripeConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    enabled: !!process.env.STRIPE_SECRET_KEY
  });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
    }

    const { applicationId, amount, currency = 'usd', type = 'installment' } = req.body;

    const application = await Application.findById(applicationId).populate('vehicle');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const transactionRef = `AFX-STRIPE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const payment = await Payment.create({
      user: req.user._id,
      application: applicationId,
      vehicle: application.vehicle._id,
      amount,
      type,
      transactionRef,
      paymentMethod: 'stripe',
      status: 'pending'
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        paymentId: payment._id.toString(),
        applicationId,
        transactionRef,
        userId: req.user._id.toString()
      },
      description: `${type === 'deposit' ? 'Down Payment' : 'Installment Payment'} for ${application.vehicle.name} - AutoFlex`,
      receipt_email: req.user.email
    });

    payment.stripePaymentIntentId = paymentIntent.id;
    payment.paymentRef = paymentIntent.id;
    await payment.save();

    res.status(201).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        payment,
        transactionRef
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating payment intent' });
  }
};

exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ success: false, message: 'Stripe not configured' });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) return res.status(404).json({ success: false, message: 'Payment intent not found' });

    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    if (paymentIntent.status === 'succeeded') {
      if (payment.status !== 'successful') {
        payment.status = 'successful';
        await payment.save();

        if (payment.type === 'deposit') {
          await Application.findByIdAndUpdate(payment.application, { status: 'active' });
        }

        const PaymentSchedule = require('../models/PaymentSchedule');
        const schedule = await PaymentSchedule.findOne({ application: payment.application });
        if (schedule) {
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
        }

        await Notification.create({
          user: payment.user,
          type: 'payment_received',
          message: `Payment of $${payment.amount.toLocaleString()} received successfully via Stripe. Ref: ${payment.transactionRef}`
        });
      }

      return res.status(200).json({ success: true, data: { payment, verified: true } });
    }

    res.status(200).json({ success: true, data: { payment, verified: false, status: paymentIntent.status } });
  } catch (error) {
    console.error('Confirm Stripe payment error:', error);
    res.status(500).json({ success: false, message: 'Server error confirming payment' });
  }
};
