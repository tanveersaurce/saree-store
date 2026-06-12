const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Category } = require('../models/index');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { deleteCache } = require('../utils/cache');

// Public — sabko categories milegi
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('order name');
  res.json({ success: true, categories });
}));

// Admin — category add karo
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const exists = await Category.findOne({ name: { $regex: req.body.name, $options: 'i' } });
  if (exists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create(req.body);
  await deleteCache('all:categories');
  await deleteCache('products:categories');
  res.status(201).json({ success: true, category });
}));

// Admin — category update karo
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  await deleteCache('all:categories');
  await deleteCache('products:categories');
  res.json({ success: true, category });
}));

// Admin — category delete karo
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  category.isActive = false;
  await category.save();
  await deleteCache('all:categories');
  await deleteCache('products:categories');
  res.json({ success: true, message: 'Category deleted' });
}));

module.exports = router;