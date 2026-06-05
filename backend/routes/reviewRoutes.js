const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Review } = require('../models/index');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, asyncHandler(async (req, res) => {
  const { product, rating, title, comment, images } = req.body;
  const existing = await Review.findOne({ user: req.user._id, product });
  if (existing) { res.status(400); throw new Error('You have already reviewed this product'); }
  const review = await Review.create({ user: req.user._id, product, rating, title, comment, images });
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, message: 'Review submitted', review });
}));

router.put('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  Object.assign(review, req.body);
  await review.save();
  res.json({ success: true, message: 'Review updated', review });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  review.isActive = false;
  await review.save();
  res.json({ success: true, message: 'Review deleted' });
}));

router.post('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  const idx = review.helpful.indexOf(req.user._id);
  if (idx === -1) review.helpful.push(req.user._id);
  else review.helpful.splice(idx, 1);
  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
}));

module.exports = router;
