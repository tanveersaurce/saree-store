const crypto = require('crypto');

// ─── Razorpay Instance ────────────────────────────────────────────────────────
const getRazorpayInstance = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── Stripe Instance ──────────────────────────────────────────────────────────
const getStripeInstance = () => {
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// ─── Create Razorpay Order ────────────────────────────────────────────────────
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, userId }) => {
  if (!amount || amount <= 0) {
    const error = new Error('Invalid amount');
    error.statusCode = 400;
    throw error;
  }

  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise me convert
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: { userId: userId.toString() },
  });

  return { order, key: process.env.RAZORPAY_KEY_ID };
};

// ─── Verify Razorpay Payment ──────────────────────────────────────────────────
const verifyRazorpayPayment = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    const error = new Error('Payment verification failed. Invalid signature.');
    error.statusCode = 400;
    throw error;
  }

  return {
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  };
};

// ─── Create Stripe Payment Intent ─────────────────────────────────────────────
const createStripeIntent = async ({ amount, currency = 'inr', userId }) => {
  const stripe = getStripeInstance();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: userId.toString() },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

// ─── Stripe Webhook Verify + Handle ──────────────────────────────────────────
const handleStripeWebhook = (rawBody, signature) => {
  const stripe = getStripeInstance();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const error = new Error(`Webhook Error: ${err.message}`);
    error.statusCode = 400;
    throw error;
  }

  // Event type handle karo
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ Stripe payment succeeded:', event.data.object.id);
      // TODO: order status update karo yahan
      break;
    case 'payment_intent.payment_failed':
      console.log('❌ Stripe payment failed:', event.data.object.id);
      // TODO: user ko notify karo yahan
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

// ─── Get Razorpay Public Key ──────────────────────────────────────────────────
const getRazorpayKey = () => {
  return { key: process.env.RAZORPAY_KEY_ID };
};

module.exports = {
  createRazorpayOrder, verifyRazorpayPayment,
  createStripeIntent, handleStripeWebhook,
  getRazorpayKey,
};