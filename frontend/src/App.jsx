import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore, useCartStore, useWishlistStore } from './context/store';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy-loaded pages
const Home          = lazy(() => import('./pages/Home'));
const ProductList   = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const OrderSuccess  = lazy(() => import('./pages/OrderSuccess'));
const Profile       = lazy(() => import('./pages/Profile'));
const Orders        = lazy(() => import('./pages/Orders'));
const OrderDetail   = lazy(() => import('./pages/OrderDetail'));
const Wishlist      = lazy(() => import('./pages/Wishlist'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const ForgotPassword= lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts  = lazy(() => import('./pages/admin/Products'));
const AdminOrders    = lazy(() => import('./pages/admin/Orders'));
const AdminUsers     = lazy(() => import('./pages/admin/Users'));
const AdminBanners   = lazy(() => import('./pages/admin/Banners'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Public-only Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { background: '#fff', color: '#2d1b3d', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
              success: { iconTheme: { primary: '#8b1a4a', secondary: '#fff' } },
            }}
          />
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <Routes>
              {/* Public Routes with main layout */}
              <Route element={<Layout />}>
                <Route path="/"                   element={<Home />} />
                <Route path="/collections"        element={<ProductList />} />
                <Route path="/collections/:category" element={<ProductList />} />
                <Route path="/search"             element={<ProductList />} />
                <Route path="/sale"               element={<ProductList />} />
                <Route path="/product/:slug"      element={<ProductDetail />} />
                <Route path="/wishlist"           element={<Wishlist />} />
                <Route path="/cart"               element={<Cart />} />

                {/* Auth required */}
                <Route path="/checkout"           element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success/:id"  element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders"             element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders/:id"         element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              </Route>

              {/* Auth pages (no layout header/footer) */}
              <Route path="/login"               element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register"            element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password"     element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                <Route index                     element={<AdminDashboard />} />
                <Route path="products"           element={<AdminProducts />} />
                <Route path="orders"             element={<AdminOrders />} />
                <Route path="users"              element={<AdminUsers />} />
                <Route path="banners"            element={<AdminBanners />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
