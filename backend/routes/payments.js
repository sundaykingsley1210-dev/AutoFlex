const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, getMyPayments, getAllPayments, getPaymentStats, processWebhook } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/my', protect, getMyPayments);
router.get('/', protect, adminOnly, getAllPayments);
router.get('/stats', protect, adminOnly, getPaymentStats);
router.post('/initiate', protect, initiatePayment);
router.get('/verify/:transactionRef', protect, verifyPayment);
router.post('/webhook', processWebhook);

module.exports = router;
