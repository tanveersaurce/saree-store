const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey,
  createStripeIntent, stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/razorpay/key', protect, getRazorpayKey);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
router.post('/stripe/create-intent', protect, createStripeIntent);
router.post('/stripe/webhook', stripeWebhook);

module.exports = router;
