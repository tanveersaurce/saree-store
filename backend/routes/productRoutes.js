const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getHomepageProducts, getCategories, updateStock, getSearchSuggestions,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/homepage', getHomepageProducts);
router.get('/categories', getCategories);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);

module.exports = router;
