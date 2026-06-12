const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');

// ─── Register ───────────────────────────────────────────
const registerUser = async ({ name, email, password, phone, gender }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password, phone, gender });

  // Verification email bhejo (background me)
  try {
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Welcome to SareeSaanvi - Verify your email',
      template: 'emailVerification',
      data: { name: user.name, url: verificationUrl },
    });
  } catch (err) {
    console.error('Email send error:', err);
  }

  return user;
};

// ─── Login ───────────────────────────────────────────────
const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Please provide email and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Contact support.');
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  return user;
};

// ─── Get Profile ─────────────────────────────────────────
const getUserProfile = async (userId) => {
  return await User.findById(userId)
    .populate('wishlist', 'name images price discountPrice slug');
};

// ─── Update Profile ──────────────────────────────────────
const updateUserProfile = async (userId, { name, phone, gender, dateOfBirth }) => {
  return await User.findByIdAndUpdate(
    userId,
    { name, phone, gender, dateOfBirth },
    { new: true, runValidators: true }
  );
};

// ─── Update Password ─────────────────────────────────────
const updateUserPassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return user;
};

// ─── Forgot Password ─────────────────────────────────────
const forgotUserPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No user found with this email');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'SareeSaanvi - Password Reset Request',
      template: 'passwordReset',
      data: { name: user.name, url: resetUrl },
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    const error = new Error('Email could not be sent. Please try again.');
    error.statusCode = 500;
    throw error;
  }
};

// ─── Reset Password ──────────────────────────────────────
const resetUserPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return user;
};

// ─── Verify Email ────────────────────────────────────────
const verifyUserEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();
};

// ─── Address ─────────────────────────────────────────────
const saveAddress = async (userId, addressData) => {
  const user = await User.findById(userId);

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  if (addressData._id) {
    const idx = user.addresses.findIndex(
      (a) => a._id.toString() === addressData._id
    );
    if (idx !== -1) user.addresses[idx] = addressData;
  } else {
    user.addresses.push(addressData);
  }

  await user.save();
  return user.addresses;
};

const removeAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  user.addresses = user.addresses.filter(
    (a) => a._id.toString() !== addressId
  );
  await user.save();
  return user.addresses;
};

module.exports = {
  registerUser, loginUser, getUserProfile,
  updateUserProfile, updateUserPassword,
  forgotUserPassword, resetUserPassword,
  verifyUserEmail, saveAddress, removeAddress,
};