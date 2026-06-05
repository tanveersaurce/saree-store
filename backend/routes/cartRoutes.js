const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { Cart } = require('../models/index');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice stock slug');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
}));

router.post('/add', protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color } = req.body;
  const product = await Product.findById(productId);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.stock < quantity) { res.status(400); throw new Error('Insufficient stock'); }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingIdx = cart.items.findIndex(
    (i) => i.product.toString() === productId && i.color === color
  );

  if (existingIdx > -1) {
    cart.items[existingIdx].quantity = Math.min(cart.items[existingIdx].quantity + quantity, 10);
  } else {
    cart.items.push({ product: productId, quantity, color, price: product.discountPrice || product.price });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock slug');
  res.json({ success: true, message: 'Added to cart', cart });
}));

router.put('/update/:itemId', protect, asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  const item = cart.items.id(req.params.itemId);
  if (!item) { res.status(404); throw new Error('Item not found in cart'); }
  if (quantity < 1) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = Math.min(quantity, 10);
  }
  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock slug');
  res.json({ success: true, cart });
}));

router.delete('/remove/:itemId', protect, asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) { res.status(404); throw new Error('Cart not found'); }
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart' });
}));

router.delete('/clear', protect, asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
}));

module.exports = router;
