const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

// ─── Razorpay ─────────────────────────────────────────────────────────────────
const getRazorpayInstance = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount <= 0) {
    res.status(400); throw new Error('Invalid amount');
  }

  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: { userId: req.user._id.toString() },
  });

  res.json({
    success: true,
    order,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed. Invalid signature.');
  }

  res.json({
    success: true,
    message: 'Payment verified successfully',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
});

// ─── Stripe ───────────────────────────────────────────────────────────────────

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe/create-intent
// @access  Private
const createStripeIntent = asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { amount, currency = 'inr' } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString() },
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// @desc    Get Razorpay key (public)
// @route   GET /api/payment/razorpay/key
// @access  Private
const getRazorpayKey = asyncHandler(async (req, res) => {
  res.json({ success: true, key: process.env.RAZORPAY_KEY_ID });
});

// @desc    Stripe webhook
// @route   POST /api/payment/stripe/webhook
// @access  Public (raw body)
const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400); throw new Error(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ Stripe payment succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      console.log('❌ Stripe payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = {
  createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey,
  createStripeIntent, stripeWebhook,
};
