const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─── Protect routes ───────────────────────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (!req.user.isActive) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Token expired, please login again');
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      throw new Error('Invalid token');
    }
    res.status(401);
    throw new Error('Not authorized');
  }
});

// ─── Admin only ───────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Admin only.');
  }
};

// ─── Optional auth (attach user if token present) ─────────────────────────────
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without user
    }
  }

  next();
});

// ─── Send JWT token in response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    loyaltyPoints: user.loyaltyPoints,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

module.exports = { protect, adminOnly, optionalAuth, sendTokenResponse };
