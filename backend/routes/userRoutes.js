const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const pageNum = parseInt(page);
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort('-createdAt').skip((pageNum - 1) * parseInt(limit)).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
}));

router.put('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password');
  res.json({ success: true, user });
}));

router.put('/:id/role', protect, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json({ success: true, user });
}));

module.exports = router;
