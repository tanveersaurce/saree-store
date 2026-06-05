const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Review } = require('../models/index');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc Dashboard stats
router.get('/dashboard', protect, adminOnly, asyncHandler(async (req, res) => {
  const [
    totalOrders, totalRevenue, totalProducts, totalUsers,
    recentOrders, lowStockProducts, ordersByStatus, revenueByMonth,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(10),
    Product.find({ stock: { $lte: 10 }, isActive: true }).select('name stock sku category').sort('stock').limit(10),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      revenueByMonth: revenueByMonth.reverse(),
    },
  });
}));

module.exports = router;
