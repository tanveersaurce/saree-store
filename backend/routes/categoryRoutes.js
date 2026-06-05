const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Category } = require('../models/index');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('order name');
  res.json({ success: true, categories });
}));

router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
}));

router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, category });
}));

module.exports = router;
