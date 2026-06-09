import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, Search, User, Menu, X,
  ChevronDown, LogOut, Package, Settings, LayoutDashboard,
} from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore, useUIStore } from '../../context/store';
import logo from '../layout/1000119603.webp'

const categories = [
  { name: 'Silk Sarees', href: '/collections/silk-sarees' },
  { name: 'Banarasi', href: '/collections/banarasi-sarees' },
  { name: 'Kanjivaram', href: '/collections/kanjivaram-sarees' },
  { name: 'Designer', href: '/collections/designer-sarees' },
  { name: 'Bridal', href: '/collections/bridal-sarees' },
  { name: 'Cotton', href: '/collections/cotton-sarees' },
  { name: 'Handloom', href: '/collections/handloom-sarees' },
  { name: 'Party Wear', href: '/collections/party-wear' },
];

export default function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { productIds } = useWishlistStore();
  const { openCart, openSearch, mobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const wishlistCount = productIds instanceof Set ? productIds.size : (productIds?.length || 0);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-pink-50' : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <nav className="page-container">
        <div className="flex items-center justify-between ">

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-saree-blush transition-colors text-saree-charcoal"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex flex-col items-center"
            onClick={closeMobileMenu}
          >
            <img
              src={logo}
              alt="Saanvi Sarees"
              className="h-14 lg:h-16 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'text-saree-rose' : ''}`}>
              Home
            </NavLink>

            {/* Collections dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button className="flex items-center gap-1 nav-link">
                Collections
                <ChevronDown size={14} className={`transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {collectionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-pink-50 py-2 overflow-hidden"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.href}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-saree-blush hover:text-saree-rose transition-colors"
                        onClick={() => setCollectionsOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Link
                        to="/collections"
                        className="flex items-center px-4 py-2.5 text-sm font-semibold text-saree-rose hover:bg-saree-blush transition-colors"
                        onClick={() => setCollectionsOpen(false)}
                      >
                        View All Collections →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/sale" className={({ isActive }) => `nav-link text-red-500 font-semibold ${isActive ? 'text-red-600' : ''}`}>
              Sale 🔥
            </NavLink>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={openSearch}
              className="btn-ghost p-2.5 rounded-full"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative btn-ghost p-2.5 rounded-full" aria-label="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="cart-badge text-[10px]">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative btn-ghost p-2.5 rounded-full"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="cart-badge"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-saree-blush transition-colors"
                >
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-saree-rose/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saree-rose to-saree-crimson flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 overflow-hidden"
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-saree-charcoal text-sm">{user?.name}</p>
                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition-colors font-medium" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-saree-blush transition-colors" onClick={() => setProfileOpen(false)}>
                        <Settings size={15} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-saree-blush transition-colors" onClick={() => setProfileOpen(false)}>
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-saree-blush transition-colors" onClick={() => setProfileOpen(false)}>
                        <Heart size={15} /> Wishlist
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 btn-primary py-2 px-4 text-sm"
              >
                <User size={15} /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden border-t border-pink-50 bg-white"
          >
            <div className="page-container py-4 space-y-1">
              {!isAuthenticated && (
                <Link to="/login" onClick={closeMobileMenu} className="block w-full btn-primary text-center mb-3">
                  Login / Register
                </Link>
              )}
              <Link to="/" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-saree-blush text-gray-700 font-medium transition-colors">Home</Link>
              <Link to="/collections" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-saree-blush text-gray-700 font-medium transition-colors">All Collections</Link>
              {categories.map((cat) => (
                <Link key={cat.name} to={cat.href} onClick={closeMobileMenu} className="block py-2.5 px-6 rounded-xl hover:bg-saree-blush text-gray-600 text-sm transition-colors">
                  {cat.name}
                </Link>
              ))}
              <Link to="/sale" onClick={closeMobileMenu} className="block py-3 px-4 rounded-xl hover:bg-red-50 text-red-500 font-semibold transition-colors">Sale 🔥</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
