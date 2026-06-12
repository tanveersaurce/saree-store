const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Cart } = require('../models/index');

// ─── Helper: Items validate + price calculate ─────────────────────────────────
const buildOrderItems = async (items) => {
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      const error = new Error(`Product not found: ${item.product}`);
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for: ${product.name}`);
      error.statusCode = 400;
      throw error;
    }

    const price = product.discountPrice || product.price;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price,
      quantity: item.quantity,
      color: item.color || '',
      sku: product.sku || '',
    });

    itemsPrice += price * item.quantity;
  }

  return { orderItems, itemsPrice };
};

// ─── Helper: Price breakdown calculate ───────────────────────────────────────
const calculatePricing = (itemsPrice, loyaltyPointsUsed = 0) => {
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const discountAmount = loyaltyPointsUsed
    ? Math.min(loyaltyPointsUsed, itemsPrice * 0.1)
    : 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  return { shippingPrice, taxPrice, discountAmount, totalPrice };
};

// ─── Create Order ─────────────────────────────────────────────────────────────
const createOrder = async (userId, { items, shippingAddress, paymentMethod, couponCode, loyaltyPointsUsed }) => {
  if (!items || items.length === 0) {
    const error = new Error('No order items');
    error.statusCode = 400;
    throw error;
  }

  const { orderItems, itemsPrice } = await buildOrderItems(items);
  const { shippingPrice, taxPrice, discountAmount, totalPrice } = calculatePricing(itemsPrice, loyaltyPointsUsed);

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    couponCode,
    loyaltyPointsUsed: loyaltyPointsUsed || 0,
    totalPrice,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    loyaltyPointsEarned: Math.floor(totalPrice / 100),
  });

  // Stock reduce karo
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Cart clear karo
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });

  return await Order.findById(order._id).populate('user', 'name email phone');
};

// ─── My Orders ────────────────────────────────────────────────────────────────
const getUserOrders = async (userId, { page = 1, limit = 10, status }) => {
  const filter = { user: userId };
  if (status) filter.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limitNum).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  };
};

// ─── Single Order ─────────────────────────────────────────────────────────────
const getOrderById = async (orderId, requestingUser) => {
  const order = await Order.findById(orderId).populate('user', 'name email phone');

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = order.user._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Not authorized to view this order');
    error.statusCode = 403;
    throw error;
  }

  return order;
};

// ─── Mark as Paid ─────────────────────────────────────────────────────────────
const markOrderPaid = async (orderId, userId, paymentResult) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'confirmed';
  order.paymentResult = paymentResult;

  const updatedOrder = await order.save();

  // Loyalty points update karo
  await User.findByIdAndUpdate(userId, {
    $inc: {
      loyaltyPoints: updatedOrder.loyaltyPointsEarned,
      totalOrders: 1,
      totalSpent: updatedOrder.totalPrice,
    },
  });

  return updatedOrder;
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────
const cancelOrder = async (orderId, requestingUser, reason) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    const error = new Error('Order cannot be cancelled at this stage');
    error.statusCode = 400;
    throw error;
  }

  const isOwner = order.user.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'admin';

  if (!isOwner && !isAdmin) {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    throw error;
  }

  order.status = 'cancelled';
  order.cancellationReason = reason || 'Cancelled by user';

  if (order.isPaid) {
    order.refundStatus = 'pending';
    order.refundAmount = order.totalPrice;
  }

  // Stock restore karo
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  await order.save();
  return order;
};

// ─── Admin: All Orders ────────────────────────────────────────────────────────
const getAllOrders = async ({ page = 1, limit = 20, status, search }) => {
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.orderNumber = { $regex: search, $options: 'i' };

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total, stats] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
    Order.aggregate([{
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' },
      },
    }]),
  ]);

  return {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    stats: stats[0] || {},
  };
};

// ─── Admin: Update Status ─────────────────────────────────────────────────────
const updateOrderStatus = async (orderId, { status, trackingNumber, trackingUrl, shippingCarrier }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (shippingCarrier) order.shippingCarrier = shippingCarrier;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();
  return order;
};

module.exports = {
  createOrder, getUserOrders, getOrderById,
  markOrderPaid, cancelOrder,
  getAllOrders, updateOrderStatus,
};