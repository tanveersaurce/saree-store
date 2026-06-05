// ─── authRoutes.js ────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, updatePassword,
  forgotPassword, resetPassword, verifyEmail, addAddress, deleteAddress, logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

module.exports = router;
