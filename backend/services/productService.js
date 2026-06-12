const Product = require('../models/Product');
const { Review } = require('../models/index');
const { getCache, setCache, deleteCache } = require('../utils/cache');

// ─── Helper: Filter object banana ─────────────────────────────────────────────
const buildFilter = (query) => {
  const {
    keyword, category, fabric, print, occasion,
    minPrice, maxPrice, minRating,
    isFeatured, isTrending, isNewArrival, isBestSeller, inStock,
  } = query;

  const filter = { isActive: true };

  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = { $in: category.split(',') };
  if (fabric) filter.fabric = { $in: fabric.split(',') };
  if (print) filter.printTechniques = { $in: print.split(',') };
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

  return filter;
};

// ─── Helper: Sort option banana ───────────────────────────────────────────────
const buildSort = (sort, keyword) => {
  const sortOptions = {
    'price-asc': { discountPrice: 1, price: 1 },
    'price-desc': { discountPrice: -1, price: -1 },
    'rating-desc': { ratings: -1 },
    'newest': { createdAt: -1 },
    'popular': { soldCount: -1 },
    'name-asc': { name: 1 },
    ...(keyword && { relevance: { score: { $meta: 'textScore' } } }),
  };
  return sortOptions[sort] || sortOptions['newest'];
};

// ─── Get All Products (filter + sort + paginate + cache) ──────────────────────
const getProducts = async (query) => {
  const { sort, page = 1, limit = 12, keyword, category, fabric, occasion, minPrice, maxPrice } = query;

  // Cache key — query params se banao
  const cacheKey = `products:${JSON.stringify(query)}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const filter = buildFilter(query);
  const sortBy = buildSort(sort, keyword);
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

  const result = {
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
  };

  await setCache(cacheKey, result, 600); // 10 min cache
  return result;
};

// ─── Get Single Product ───────────────────────────────────────────────────────
const getProduct = async (slug) => {
  const cacheKey = `product:${slug}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const product = await Product.findOne({
    $or: [
      { slug },
      { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null },
    ],
    isActive: true,
  });

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // View count badhao (cache se bahar — har baar chalega)
  await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id, isActive: true })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(10),
    Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .select('name slug images price discountPrice ratings')
      .limit(6)
      .lean(),
  ]);

  const result = { product, reviews, related };
  await setCache(cacheKey, result, 1800); // 30 min cache
  return result;
};

// ─── Create Product ───────────────────────────────────────────────────────────
const createProduct = async (data) => {
  const product = await Product.create(data);
  await deleteCache('homepage:products');   // homepage cache invalidate
  await deleteCache('products:categories'); // categories cache invalidate
  return product;
};

// ─── Update Product ───────────────────────────────────────────────────────────
const updateProduct = async (productId, data) => {
  // findById + save — taaki pre('save') hooks aur validators sahi se chalein
  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  Object.keys(data).forEach((field) => {
    product[field] = data[field];
  });

  const updated = await product.save();

  // Cache invalidate karo
  await deleteCache(`product:${product.slug}`);
  await deleteCache('homepage:products');

  return updated;
};

// ─── Delete Product (soft delete) ────────────────────────────────────────────
const deleteProduct = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  product.isActive = false;
  await product.save();

  // Cache invalidate karo
  await deleteCache(`product:${product.slug}`);
  await deleteCache('homepage:products');
  await deleteCache('products:categories');
};

// ─── Homepage Products ────────────────────────────────────────────────────────
const getHomepageProducts = async () => {
  const cacheKey = 'homepage:products';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const select = 'name slug images price discountPrice discountPercent ratings numReviews fabric category';

  const [featured, trending, newArrivals, bestSellers] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true }).select(select).limit(8).lean(),
    Product.find({ isTrending: true, isActive: true }).select(select).limit(8).lean(),
    Product.find({ isNewArrival: true, isActive: true }).select(select).sort('-createdAt').limit(8).lean(),
    Product.find({ isBestSeller: true, isActive: true }).select(select).sort('-soldCount').limit(8).lean(),
  ]);

  const result = { featured, trending, newArrivals, bestSellers };
  await setCache(cacheKey, result, 600); // 10 min cache
  return result;
};

// ─── Categories ───────────────────────────────────────────────────────────────
const getCategories = async () => {
  const cacheKey = 'products:categories';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, sample: { $first: '$images' } } },
    { $sort: { count: -1 } },
  ]);

  await setCache(cacheKey, categories, 3600); // 1 hour cache
  return categories;
};

// ─── Update Stock ─────────────────────────────────────────────────────────────
const updateStock = async (productId, stock) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { stock },
    { new: true }
  );

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Product cache invalidate karo
  await deleteCache(`product:${product.slug}`);
  return product;
};

// ─── Search Suggestions (autocomplete) ───────────────────────────────────────
const getSearchSuggestions = async (q) => {
  if (!q || q.length < 2) return [];

  const cacheKey = `suggestions:${q.toLowerCase()}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const suggestions = await Product.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name slug category images price')
    .limit(8)
    .lean();

  await setCache(cacheKey, suggestions, 3600); // 1 hour cache
  return suggestions;
};

module.exports = {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, getHomepageProducts,
  getCategories, updateStock, getSearchSuggestions,
};