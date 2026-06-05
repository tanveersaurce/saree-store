const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Banner } = require('../models/index');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', asyncHandler(async (req, res) => {
  const { position } = req.query;
  const filter = { isActive: true };
  if (position) filter.position = position;
  const now = new Date();
  filter.$or = [{ startDate: null }, { startDate: { $lte: now } }];
  const banners = await Banner.find(filter).sort('order');
  res.json({ success: true, banners });
}));

router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
}));

router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, banner });
}));

router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Banner deleted' });
}));

module.exports = router;
