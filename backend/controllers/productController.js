const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');

const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.json({ success: true, ...result });
});

const getProduct = asyncHandler(async (req, res) => {
  const result = await productService.getProduct(req.params.slug);
  res.json({ success: true, ...result });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, message: 'Product updated successfully', product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.json({ success: true, message: 'Product deactivated successfully' });
});

const getHomepageProducts = asyncHandler(async (req, res) => {
  const result = await productService.getHomepageProducts();
  res.json({ success: true, ...result });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  res.json({ success: true, categories });
});

const updateStock = asyncHandler(async (req, res) => {
  const product = await productService.updateStock(req.params.id, req.body.stock);
  res.json({ success: true, message: 'Stock updated', product });
});

const getSearchSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await productService.getSearchSuggestions(req.query.q);
  res.json({ success: true, suggestions });
});

module.exports = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getHomepageProducts, getCategories, updateStock, getSearchSuggestions,
};