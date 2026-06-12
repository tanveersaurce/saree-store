const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');
const { sendTokenResponse } = require('../middleware/authMiddleware');

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  sendTokenResponse(user, 201, res, 'Account created successfully!');
});

const login = asyncHandler(async (req, res) => {
  const user = await authService.loginUser(req.body);
  sendTokenResponse(user, 200, res, 'Login successful');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);
  res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  res.json({ success: true, message: 'Profile updated successfully', user });
});

const updatePassword = asyncHandler(async (req, res) => {
  const user = await authService.updateUserPassword(req.user._id, req.body);
  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotUserPassword(req.body.email);
  res.json({ success: true, message: 'Password reset email sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetUserPassword({
    token: req.params.token,
    newPassword: req.body.password,
  });
  sendTokenResponse(user, 200, res, 'Password reset successful');
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyUserEmail(req.params.token);
  res.json({ success: true, message: 'Email verified successfully' });
});

const addAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.saveAddress(req.user._id, req.body);
  res.json({ success: true, message: 'Address saved', addresses });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const addresses = await authService.removeAddress(req.user._id, req.params.addressId);
  res.json({ success: true, message: 'Address deleted', addresses });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
  register, login, getMe, updateProfile, updatePassword,
  forgotPassword, resetPassword, verifyEmail,
  addAddress, deleteAddress, logout,
};