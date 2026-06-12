const Category = require('../models/Category');
const { deleteCache, getCache, setCache } = require('../utils/cache');

const getAllCategories = async () => {
  const cacheKey = 'all:categories';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const categories = await Category.find({ isActive: true }).sort('name');
  await setCache(cacheKey, categories, 3600);
  return categories;
};

const addCategory = async (name) => {
  const existing = await Category.findOne({ name: { $regex: name, $options: 'i' } });
  if (existing) {
    const error = new Error('Category already exists');
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({ name });
  await deleteCache('all:categories');
  await deleteCache('products:categories');
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  category.isActive = false;
  await category.save();
  await deleteCache('all:categories');
  await deleteCache('products:categories');
};

module.exports = { getAllCategories, addCategory, deleteCategory };