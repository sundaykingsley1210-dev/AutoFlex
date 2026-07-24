const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmStripePayment, getStripeConfig } = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

router.get('/config', protect, getStripeConfig);
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmStripePayment);

module.exports = router;
