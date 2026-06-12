const asyncHandler = require('express-async-handler');
const paymentService = require('../services/paymentService');

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createRazorpayOrder({
    ...req.body,
    userId: req.user._id,
  });
  res.json({ success: true, ...result });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const result = paymentService.verifyRazorpayPayment(req.body);
  res.json({ success: true, message: 'Payment verified successfully', ...result });
});

const createStripeIntent = asyncHandler(async (req, res) => {
  const result = await paymentService.createStripeIntent({
    ...req.body,
    userId: req.user._id,
  });
  res.json({ success: true, ...result });
});

const getRazorpayKey = asyncHandler(async (req, res) => {
  const result = paymentService.getRazorpayKey();
  res.json({ success: true, ...result });
});

const stripeWebhook = asyncHandler(async (req, res) => {
  const result = paymentService.handleStripeWebhook(
    req.rawBody,
    req.headers['stripe-signature']
  );
  res.json(result);
});

module.exports = {
  createRazorpayOrder, verifyRazorpayPayment,
  createStripeIntent, getRazorpayKey, stripeWebhook,
};