const asyncHandler = require('express-async-handler');
const orderService = require('../services/orderService');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Order placed successfully', order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  res.json({ success: true, ...result });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);
  res.json({ success: true, order });
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await orderService.markOrderPaid(req.params.id, req.user._id, req.body);
  res.json({ success: true, message: 'Payment confirmed', order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user, req.body.reason);
  res.json({ success: true, message: 'Order cancelled successfully', order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  res.json({ success: true, ...result });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body);
  res.json({ success: true, message: `Order status updated to ${req.body.status}`, order });
});

module.exports = {
  createOrder, getMyOrders, getOrder,
  updateOrderToPaid, cancelOrder,
  getAllOrders, updateOrderStatus,
};