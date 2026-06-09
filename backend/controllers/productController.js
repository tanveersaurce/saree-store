const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { Review } = require('../models/index');

// ─── @desc  Get all products with filter/sort/paginate ────────────────────────
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
  keyword, category, fabric, print, occasion, minPrice, maxPrice,
  minRating, sort, page = 1, limit = 12,
    isFeatured, isTrending, isNewArrival, isBestSeller, inStock,
  } = req.query;

  const filter = { isActive: true };

  if (keyword) {
    filter.$text = { $search: keyword };
  }

  if (category) filter.category = { $in: category.split(',') };
  if (fabric) filter.fabric = { $in: fabric.split(',') };
  if (req.query.print) filter.printTechniques = { $in: req.query.print.split(',') };
  if (occasion) filter.occasion = { $in: occasion.split(',') };
  if (minPrice || maxPrice) {
    filter.$or = [
      { discountPrice: { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) } },
      { price: { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) } },
    ];
  }
  if (minRating) filter.ratings = { $gte: +minRating };
  if (isFeatured === 'true') filter.isFeatured = true;
  if (isTrending === 'true') filter.isTrending = true;
  if (isNewArrival === 'true') filter.isNewArrival = true;
  if (isBestSeller === 'true') filter.isBestSeller = true;
  if (inStock === 'true') filter.stock = { $gt: 0 };

  const sortOptions = {
    'price-asc': { discountPrice: 1, price: 1 },
    'price-desc': { discountPrice: -1, price: -1 },
    'rating-desc': { ratings: -1 },
    'newest': { createdAt: -1 },
    'popular': { soldCount: -1 },
    'name-asc': { name: 1 },
    ...(keyword && { relevance: { score: { $meta: 'textScore' } } }),
  };
  const sortBy = sortOptions[sort] || sortOptions['newest'];

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('name slug images price discountPrice discountPercent category fabric ratings numReviews stock isFeatured isTrending isNewArrival isBestSeller createdAt')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
    filters: { category, fabric, occasion, minPrice, maxPrice, sort },
  });
});

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }],
    isActive: true,
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  const reviews = await Review.find({ product: product._id, isActive: true })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .select('name slug images price discountPrice ratings')
    .limit(6)
    .lean();

  res.json({ success: true, product, reviews, related });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  // Use findById + save so that validators work correctly with `this`
  // (findByIdAndUpdate with runValidators: true breaks `this.price` in custom validators)
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Manually apply all fields from req.body onto the document
  const fields = Object.keys(req.body);
  fields.forEach((field) => {
    product[field] = req.body[field];
  });

  // Save triggers pre('save') hooks and validators with correct `this` context
  const updated = await product.save();

  res.json({ success: true, message: 'Product updated successfully', product: updated });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deactivated successfully' });
});

// @desc    Get featured/trending products for homepage
// @route   GET /api/products/homepage
// @access  Public
const getHomepageProducts = asyncHandler(async (req, res) => {
  const [featured, trending, newArrivals, bestSellers] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true }).select('name slug images price discountPrice discountPercent ratings numReviews fabric category').limit(8).lean(),
    Product.find({ isTrending: true, isActive: true }).select('name slug images price discountPrice discountPercent ratings numReviews fabric category').limit(8).lean(),
    Product.find({ isNewArrival: true, isActive: true }).select('name slug images price discountPrice discountPercent ratings numReviews fabric category').sort('-createdAt').limit(8).lean(),
    Product.find({ isBestSeller: true, isActive: true }).select('name slug images price discountPrice discountPercent ratings numReviews fabric category').sort('-soldCount').limit(8).lean(),
  ]);

  res.json({ success: true, featured, trending, newArrivals, bestSellers });
});

// @desc    Get product categories with counts
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, sample: { $first: '$images' } } },
    { $sort: { count: -1 } },
  ]);

  res.json({ success: true, categories });
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Admin
const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true }
  );
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, message: 'Stock updated', product });
});

// @desc    Search suggestions (autocomplete)
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

  const products = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name slug category images price')
    .limit(8)
    .lean();

  res.json({ success: true, suggestions: products });
});

module.exports = {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getHomepageProducts, getCategories, updateStock, getSearchSuggestions,
};