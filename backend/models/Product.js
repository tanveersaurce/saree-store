const mongoose = require('mongoose');
const slugify = require('slugify');

const imageSchema = new mongoose.Schema({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  isMain: { type: Boolean, default: false },
});

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  colorImages: [imageSchema],
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: { type: String, unique: true, sparse: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (v) {
          return !v || v < this.price;
        },
        message: 'Discount price must be less than original price',
      },
    },
    discountPercent: { type: Number, default: 0 },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Silk Sarees',
        'Cotton Sarees',
        'Designer Sarees',
        'Bridal Sarees',
        'Casual Sarees',
        'Party Wear',
        'Handloom Sarees',
        'Georgette Sarees',
        'Chiffon Sarees',
        'Net Sarees',
        'Banarasi Sarees',
        'Kanjivaram Sarees',
        'Chanderi Sarees',
        'Tussar Sarees',
        'Patola Sarees',
      ],
    },
    subcategory: { type: String, trim: true },
    fabric: {
      type: String,
      required: [true, 'Fabric type is required'],
      enum: ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Net', 'Satin', 'Linen', 'Banarasi', 'Tussar', 'Organza', 'Crepe', 'Velvet', 'Brocade', 'Mixed'],
    },
    printTechniques: [{
      type: String,
      enum: [
        'Bagru',
        'Batik',
        'Dabu',
        'Zari-Zardozi',
        'Ajrakh',
        'Bandhani',
        'Leheriya',
        'Kalamkari',
        'Block Print',
        'Ikat',
        'Shibori'
      ]
    }],
    occasion: [{
      type: String,
      enum: ['Wedding', 'Festival', 'Party', 'Casual', 'Office', 'Bridal', 'Puja', 'Sangeet', 'Reception', 'Traditional'],
    }],
    images: [imageSchema],
    variants: [variantSchema],
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    blouseIncluded: { type: Boolean, default: false },
    blouseLength: { type: Number, default: 0.8 }, // in meters
    sareeLength: { type: Number, default: 5.5 }, // in meters
    weight: { type: Number, default: 500 }, // in grams
    careInstructions: {
      type: String,
      default: 'Dry clean only',
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    brand: { type: String, default: 'SareeSaanvi Original' },
    origin: { type: String, default: 'India' },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
    metaImage: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isTrending: 1, isNewArrival: 1 });

// ─── Generate slug before save ────────────────────────────────────────────────
productSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 0;
    while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }
    this.slug = slug;
  }

  // Calculate discount percent
  if (this.discountPrice && this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  } else {
    this.discountPercent = 0;
  }

  next();
});

// ─── Virtual: effective price ─────────────────────────────────────────────────
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice || this.price;
});

// ─── Virtual: reviews ─────────────────────────────────────────────────────────
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// ─── Virtual: isInStock ───────────────────────────────────────────────────────
productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});

module.exports = mongoose.model('Product', productSchema);
