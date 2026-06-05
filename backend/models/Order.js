const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  color: { type: String, default: '' },
  sku: { type: String, default: '' },
});

const orderStatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod', 'upi', 'netbanking'],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      razorpay_payment_id: String,
      razorpay_order_id: String,
      razorpay_signature: String,
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded', 'return_requested', 'returned'],
      default: 'pending',
    },
    statusHistory: [orderStatusHistorySchema],
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    estimatedDelivery: { type: Date },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    shippingCarrier: { type: String, default: '' },
    notes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    refundAmount: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' },
    gift: {
      isGift: { type: Boolean, default: false },
      giftMessage: { type: String, default: '' },
    },
    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Generate order number before save ───────────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 900000) + 100000;
    this.orderNumber = `SS${year}${month}${random}`;
  }

  // Push status to history on status change
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }

  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
