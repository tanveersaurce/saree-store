require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { Banner, Category } = require('../models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding');
};

const sampleProducts = [
  {
    name: 'Kanjivaram Pure Silk Saree - Royal Crimson',
    slug: 'kanjivaram-pure-silk-saree-royal-crimson',
    description: 'Exquisite Kanjivaram silk saree woven with 22-carat gold zari work. Features a rich crimson body with contrasting peacock motif border. Perfect for weddings and grand occasions.',
    shortDescription: 'Pure Kanjivaram silk with gold zari peacock border',
    price: 28999,
    discountPrice: 24999,
    category: 'Kanjivaram Sarees',
    fabric: 'Silk',
    occasion: ['Wedding', 'Festival', 'Bridal'],
    images: [
      { public_id: 'sample1', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', isMain: true, alt: 'Kanjivaram Crimson Saree' },
    ],
    stock: 15,
    blouseIncluded: true,
    blouseLength: 0.8,
    sareeLength: 5.5,
    weight: 800,
    careInstructions: 'Dry clean only. Store in muslin cloth.',
    tags: ['kanjivaram', 'silk', 'bridal', 'wedding', 'zari', 'gold'],
    isFeatured: true,
    isBestSeller: true,
    ratings: 4.8,
    numReviews: 124,
    origin: 'Kanchipuram, Tamil Nadu',
  },
  {
    name: 'Banarasi Brocade Saree - Midnight Blue',
    slug: 'banarasi-brocade-saree-midnight-blue',
    description: 'Stunning Banarasi brocade saree in deep midnight blue with silver zari butis scattered across the body. The pallu features an intricate temple border that is a hallmark of Banarasi weaving.',
    shortDescription: 'Midnight blue Banarasi brocade with silver zari',
    price: 18500,
    discountPrice: 15999,
    category: 'Banarasi Sarees',
    fabric: 'Brocade',
    occasion: ['Wedding', 'Festival', 'Reception', 'Sangeet'],
    images: [
      { public_id: 'sample2', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', isMain: true, alt: 'Banarasi Blue Saree' },
    ],
    stock: 22,
    blouseIncluded: true,
    tags: ['banarasi', 'brocade', 'blue', 'silver', 'traditional', 'wedding'],
    isTrending: true,
    isFeatured: true,
    ratings: 4.6,
    numReviews: 89,
    origin: 'Varanasi, Uttar Pradesh',
  },
  {
    name: 'Chanderi Silk Cotton Saree - Blush Pink',
    slug: 'chanderi-silk-cotton-saree-blush-pink',
    description: 'Delicate Chanderi silk-cotton saree in dreamy blush pink. Features subtle gold bootis and a delicate zari border. Lightweight and perfect for summer festivals.',
    shortDescription: 'Lightweight Chanderi silk-cotton in blush pink',
    price: 8999,
    discountPrice: 6999,
    category: 'Chanderi Sarees',
    fabric: 'Mixed',
    occasion: ['Festival', 'Casual', 'Puja'],
    images: [
      { public_id: 'sample3', url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800', isMain: true, alt: 'Chanderi Pink Saree' },
    ],
    stock: 35,
    blouseIncluded: false,
    tags: ['chanderi', 'silk-cotton', 'pink', 'lightweight', 'festival'],
    isNewArrival: true,
    ratings: 4.4,
    numReviews: 56,
    origin: 'Chanderi, Madhya Pradesh',
  },
  {
    name: 'Designer Georgette Saree - Emerald Green',
    slug: 'designer-georgette-saree-emerald-green',
    description: 'Contemporary designer georgette saree in rich emerald green. Features hand-embroidered sequin work and intricate thread embroidery on the pallu. A perfect blend of traditional and modern.',
    shortDescription: 'Hand-embroidered georgette saree in emerald green',
    price: 12500,
    discountPrice: 9999,
    category: 'Designer Sarees',
    fabric: 'Georgette',
    occasion: ['Party', 'Reception', 'Sangeet'],
    images: [
      { public_id: 'sample4', url: 'https://images.unsplash.com/photo-1629673217116-59d75b019c73?w=800', isMain: true, alt: 'Emerald Georgette Saree' },
    ],
    stock: 18,
    tags: ['designer', 'georgette', 'green', 'sequin', 'party-wear'],
    isTrending: true,
    ratings: 4.5,
    numReviews: 73,
  },
  {
    name: 'Tussar Silk Saree - Earthy Amber',
    slug: 'tussar-silk-saree-earthy-amber',
    description: 'Natural Tussar silk saree in warm earthy amber tones. Features tribal Warli art prints on the body and a contrasting dark border. Handloom crafted by artisans from Jharkhand.',
    shortDescription: 'Natural Tussar silk with tribal Warli art prints',
    price: 7500,
    discountPrice: 5999,
    category: 'Tussar Sarees',
    fabric: 'Tussar',
    occasion: ['Casual', 'Festival', 'Office'],
    images: [
      { public_id: 'sample5', url: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=800', isMain: true, alt: 'Tussar Amber Saree' },
    ],
    stock: 28,
    tags: ['tussar', 'handloom', 'tribal', 'earthy', 'artisan'],
    isNewArrival: true,
    ratings: 4.3,
    numReviews: 42,
    origin: 'Jharkhand',
  },
  {
    name: 'Organza Saree - Lavender Dreams',
    slug: 'organza-saree-lavender-dreams',
    description: 'Ethereal organza saree in soft lavender with hand-painted floral motifs. The sheer fabric creates a dreamy, goddess-like drape. Comes with a matching embellished blouse piece.',
    shortDescription: 'Hand-painted organza in dreamy lavender',
    price: 15000,
    discountPrice: 12500,
    category: 'Designer Sarees',
    fabric: 'Organza',
    occasion: ['Party', 'Reception', 'Wedding'],
    images: [
      { public_id: 'sample6', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b05?w=800', isMain: true, alt: 'Lavender Organza Saree' },
    ],
    stock: 12,
    blouseIncluded: true,
    tags: ['organza', 'lavender', 'hand-painted', 'sheer', 'elegant'],
    isFeatured: true,
    isTrending: true,
    ratings: 4.7,
    numReviews: 61,
  },
];

const sampleBanners = [
  {
    title: 'New Bridal Collection 2025',
    subtitle: 'Crafted for Your Moment',
    description: 'Discover our exclusive bridal sarees handpicked from the finest weavers across India.',
    image: { public_id: 'banner1', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&h=600&fit=crop' },
    link: '/collections/bridal',
    buttonText: 'Explore Bridal',
    position: 'hero',
    order: 1,
    bgColor: '#2d1b3d',
    textColor: '#f8e8f0',
    isActive: true,
  },
  {
    title: 'Monsoon Sale — Up to 40% Off',
    subtitle: 'Limited Time Offer',
    description: 'Refresh your wardrobe with our season-best deals on silk, cotton, and designer sarees.',
    image: { public_id: 'banner2', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1400&h=600&fit=crop' },
    link: '/sale',
    buttonText: 'Shop Sale',
    position: 'hero',
    order: 2,
    bgColor: '#8b1a4a',
    textColor: '#fdf8f5',
    isActive: true,
  },
];

const categories = [
  { name: 'Silk Sarees', slug: 'silk-sarees', order: 1, isFeatured: true, isActive: true },
  { name: 'Banarasi Sarees', slug: 'banarasi-sarees', order: 2, isFeatured: true, isActive: true },
  { name: 'Kanjivaram Sarees', slug: 'kanjivaram-sarees', order: 3, isFeatured: true, isActive: true },
  { name: 'Designer Sarees', slug: 'designer-sarees', order: 4, isFeatured: true, isActive: true },
  { name: 'Bridal Sarees', slug: 'bridal-sarees', order: 5, isFeatured: true, isActive: true },
  { name: 'Cotton Sarees', slug: 'cotton-sarees', order: 6, isActive: true },
  { name: 'Georgette Sarees', slug: 'georgette-sarees', order: 7, isActive: true },
  { name: 'Chanderi Sarees', slug: 'chanderi-sarees', order: 8, isActive: true },
  { name: 'Handloom Sarees', slug: 'handloom-sarees', order: 9, isActive: true },
  { name: 'Party Wear', slug: 'party-wear', order: 10, isActive: true },
];

const seedDB = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Banner.deleteMany({}),
      Category.deleteMany({}),
    ]);

    console.log('👤 Creating admin user...');
    await User.create({
      name: 'Admin User',
      email: 'admin@sareesaanvi.com',
      password: 'admin@123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    });

    await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'user@123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      phone: '9876543210',
    });

    console.log('📦 Creating products...');
    await Product.insertMany(sampleProducts);

    console.log('🖼️  Creating banners...');
    await Banner.insertMany(sampleBanners);

    console.log('📂 Creating categories...');
    await Category.insertMany(categories);

    console.log(`
✅ Database seeded successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 Admin:  admin@sareesaanvi.com / admin@123
👤 User:   priya@example.com / user@123
📦 Products: ${sampleProducts.length}
🖼️  Banners: ${sampleBanners.length}
📂 Categories: ${categories.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();