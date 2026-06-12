const asyncHandler = require('express-async-handler');
const categoryService = require('../services/categoryService');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.json({ success: true, categories });
});

const addCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.addCategory(req.body.name);
  res.status(201).json({ success: true, message: 'Category added', category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, addCategory, deleteCategory };