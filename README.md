# 🌸 SareeSaanvi — Premium MERN eCommerce for Sarees

A production-ready, full-stack eCommerce platform for selling sarees, built with the MERN stack. Features a modern, luxurious, Gen-Z fashion aesthetic with glassmorphism effects, smooth animations, and a complete admin dashboard.

---

## 🖼️ Preview

| Page | Description |
|------|-------------|
| **Home** | Hero carousel, category grid, product tabs (Featured/Trending/New/BestSeller), testimonials |
| **Collections** | Advanced filtering, sorting, pagination, mobile filter drawer |
| **Product Detail** | Image gallery, color variants, reviews, related products, pincode check |
| **Cart/Checkout** | Slide-in drawer, 3-step checkout, Razorpay integration |
| **Admin Dashboard** | Revenue chart, order tracking, low-stock alerts, product CRUD |

---

## ✨ Features

### 🛍️ Customer Features
- Beautiful hero banner carousel with fade transitions
- Shop by category (Kanjivaram, Banarasi, Silk, Bridal, etc.)
- Advanced product filtering (fabric, occasion, price, rating)
- Product quick-view, wishlist, cart drawer
- Animated product cards with hover effects
- Pincode-based delivery check
- Multi-step checkout with address book
- Razorpay & COD payment options
- Order tracking with status timeline
- Review & ratings system
- Loyalty points system
- Coupon/discount support
- Email notifications (order confirmation, OTP, password reset)
- Responsive mobile-first design

### 👑 Admin Features
- Real-time dashboard with revenue charts
- Product CRUD with image upload (Cloudinary)
- Order management with status updates & tracking
- Customer management
- Banner management
- Inventory / low-stock alerts

### 🔐 Auth & Security
- JWT authentication with refresh
- Bcrypt password hashing (12 rounds)
- Rate limiting on auth endpoints
- Helmet security headers
- CORS configuration
- Input validation & sanitization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Framer Motion, Zustand, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Images | Cloudinary + Multer |
| Payments | Razorpay (primary), Stripe (alternate) |
| Email | Nodemailer (SMTP) |
| UI Components | Swiper, React Hot Toast, Lucide Icons |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- Razorpay account (test mode)

---

### 1. Clone & Install

```bash
# Install root concurrently tool
npm install

# Install all dependencies at once
npm run install:all

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

---

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your real values:

```env
# Required
MONGO_URI=mongodb://localhost:27017/saree-store
JWT_SECRET=your_super_secret_min_32_chars_here

# Cloudinary (get from cloudinary.com → Dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret

# Email (Gmail: use App Password, not your real password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@sareesaanvi.com
FROM_NAME=SareeSaanvi
```

---

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- 👑 Admin: `admin@sareesaanvi.com` / `admin@123`
- 👤 User: `priya@example.com` / `user@123`
- 6 sample products with real images
- 2 hero banners
- 10 product categories

---

### 4. Run Development Servers

```bash
# Run both frontend and backend together
npm run dev

# Or run individually:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:3000
```

---

## 📁 Project Structure

```
saree-store/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary setup
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile, address
│   │   ├── productController.js   # CRUD, filters, homepage
│   │   ├── orderController.js     # Create, track, cancel, admin
│   │   └── paymentController.js   # Razorpay + Stripe
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect, adminOnly
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/
│   │   ├── User.js                # User schema with addresses
│   │   ├── Product.js             # Product with variants, SEO
│   │   ├── Order.js               # Order with status history
│   │   └── index.js               # Review, Cart, Banner, Coupon
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── bannerRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── sendEmail.js           # Nodemailer with HTML templates
│   │   └── seeder.js              # DB seed script
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx           # Main layout wrapper
    │   │   │   ├── AdminLayout.jsx      # Admin sidebar layout
    │   │   │   ├── Navbar.jsx           # Responsive navbar + mega menu
    │   │   │   ├── Footer.jsx           # Newsletter + links + social
    │   │   │   └── AnnouncementBar.jsx  # Animated marquee bar
    │   │   ├── product/
    │   │   │   └── ProductCard.jsx      # Hover effects, wishlist, add to cart
    │   │   ├── cart/
    │   │   │   └── CartDrawer.jsx       # Slide-in cart with summary
    │   │   └── common/
    │   │       ├── LoadingSpinner.jsx
    │   │       ├── ScrollToTop.jsx
    │   │       └── SearchModal.jsx      # Autocomplete search
    │   ├── context/
    │   │   └── store.js             # Zustand: auth, cart, wishlist, UI
    │   ├── pages/
    │   │   ├── Home.jsx             # Hero + categories + products + CTA
    │   │   ├── ProductList.jsx      # Filters, sort, pagination
    │   │   ├── ProductDetail.jsx    # Gallery, variants, reviews
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx         # 3-step with Razorpay
    │   │   ├── Profile.jsx
    │   │   ├── Orders.jsx / OrderDetail.jsx / OrderSuccess.jsx
    │   │   ├── Wishlist.jsx
    │   │   ├── Login.jsx / Register.jsx
    │   │   ├── ForgotPassword.jsx / ResetPassword.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx    # Stats, revenue chart, recent orders
    │   │       ├── Products.jsx     # Full CRUD with modal form
    │   │       ├── Orders.jsx       # Status update, tracking
    │   │       ├── Users.jsx        # Customer list
    │   │       └── Banners.jsx      # Banner management
    │   ├── services/
    │   │   └── api.js               # Axios client + all API calls
    │   ├── App.jsx                  # Routes + QueryClient
    │   ├── index.js
    │   └── index.css                # Tailwind + custom design system
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 🎨 Design System

The UI uses a custom Tailwind design system with:

| Token | Value | Usage |
|-------|-------|-------|
| `saree-rose` | `#8b1a4a` | Primary brand color |
| `saree-crimson` | `#c2185b` | Gradients, accents |
| `saree-gold` | `#c9a84c` | Luxury accents |
| `saree-charcoal` | `#2d1b3d` | Headings, dark text |
| `saree-blush` | `#fdf0f5` | Light backgrounds |
| `saree-ivory` | `#fdfaf5` | Page background |

**Fonts:**
- `Playfair Display` — headings, display text
- `DM Sans` — body text, UI
- `Cormorant Garamond` — italic accents, subheadings

**Custom utilities:**
- `.btn-primary` / `.btn-secondary` / `.btn-gold`
- `.glass-card` — glassmorphism cards
- `.product-card` — animated product cards
- `.text-gradient-brand` — pink gradient text
- `.skeleton` — shimmer loading states
- `.marquee-track` — infinite scrolling announcements

---

## 🌐 API Reference

### Auth
```
POST  /api/auth/register       Create account
POST  /api/auth/login          Login
GET   /api/auth/me             Get current user (protected)
PUT   /api/auth/profile        Update profile
PUT   /api/auth/password       Change password
POST  /api/auth/forgot-password   Send reset email
PUT   /api/auth/reset-password/:token
POST  /api/auth/address        Add/update address
DELETE /api/auth/address/:id   Delete address
```

### Products
```
GET   /api/products                    List (with filters)
GET   /api/products/homepage           Featured/Trending/New/BestSellers
GET   /api/products/categories         Categories with counts
GET   /api/products/search/suggestions Autocomplete
GET   /api/products/:slug              Single product + reviews + related
POST  /api/products                    Create (admin)
PUT   /api/products/:id                Update (admin)
DELETE /api/products/:id               Deactivate (admin)
```

### Orders
```
POST  /api/orders               Place order
GET   /api/orders/my-orders     User's orders
GET   /api/orders/:id           Order details
PUT   /api/orders/:id/pay       Mark paid
PUT   /api/orders/:id/cancel    Cancel
GET   /api/orders/admin/all     All orders (admin)
PUT   /api/orders/:id/status    Update status (admin)
```

### Cart, Wishlist, Reviews — all protected routes

### Payment
```
GET   /api/payment/razorpay/key             Get public key
POST  /api/payment/razorpay/create-order    Create Razorpay order
POST  /api/payment/razorpay/verify          Verify signature
POST  /api/payment/stripe/create-intent     Stripe PaymentIntent
```

### Admin
```
GET   /api/admin/dashboard     Stats, revenue, recent orders, low stock
GET   /api/users               All users (admin)
PUT   /api/users/:id/status    Ban/unban user
PUT   /api/users/:id/role      Change role
```

---

## 🚢 Deployment

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Get connection string → update `MONGO_URI` in `.env`

### Render.com (Backend)
1. Connect GitHub repo
2. Set `Root directory` → `backend`
3. Build: `npm install`, Start: `npm start`
4. Add all `.env` variables in Environment tab

### Vercel (Frontend)
1. Connect repo, set `Root directory` → `frontend`
2. Add `REACT_APP_API_URL=https://your-backend.onrender.com/api`
3. Deploy

### Full-stack on Render
Set `NODE_ENV=production` in backend — Express will serve the React build from `frontend/build`.

---

## 🔧 Customization Guide

### Add a new saree category
1. Add to `category` enum in `backend/models/Product.js`
2. Add to `FEATURED_CATEGORIES` array in `frontend/src/pages/Home.jsx`
3. Add to `categories` array in `frontend/src/components/layout/Navbar.jsx`
4. Seed with `npm run seed`

### Change brand colors
Edit `tailwind.config.js` → `colors.saree.*` and `index.css` → `:root` CSS variables.

### Add a payment method
1. Install SDK in `backend/` (`npm install stripe` or any gateway)
2. Add controller in `backend/controllers/paymentController.js`
3. Add route in `backend/routes/paymentRoutes.js`
4. Add option in `frontend/src/pages/Checkout.jsx` payment method list

---

## 📝 License

MIT License — free to use for personal and commercial projects.

---

## 🙏 Credits

Built with ❤️ for the Indian handloom & saree community.  
Celebrating the timeless art of Indian weaving.

**Images:** Unsplash (for demo purposes only — replace with your own for production)

---

*SareeSaanvi — Where every saree tells a story* 🌸
