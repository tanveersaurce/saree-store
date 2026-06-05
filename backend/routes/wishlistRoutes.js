const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price discountPrice ratings numReviews stock');
  res.json({ success: true, wishlist: user.wishlist });
}));

router.post('/toggle/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.params.productId);
  let message;
  if (idx === -1) {
    user.wishlist.push(req.params.productId);
    message = 'Added to wishlist';
  } else {
    user.wishlist.splice(idx, 1);
    message = 'Removed from wishlist';
  }
  await user.save();
  res.json({ success: true, message, inWishlist: idx === -1, wishlist: user.wishlist });
}));

module.exports = router;
