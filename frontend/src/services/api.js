import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saree_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle errors ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('saree_token');
      localStorage.removeItem('saree_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session=expired';
      }
    }

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  addAddress: (data) => api.post('/auth/address', data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
};

// ─── Products API ─────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  getHomepage: () => api.get('/products/homepage'),
  getCategories: () => api.get('/products/categories'),
  getSuggestions: (q) => api.get('/products/search/suggestions', { params: { q } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
};

// ─── Orders API ───────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  pay: (id, data) => api.put(`/orders/${id}/pay`, data),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  getAll: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ─── Cart API ─────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity, color) => api.post('/cart/add', { productId, quantity, color }),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// ─── Wishlist API ─────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
};

// ─── Payment API ──────────────────────────────────────────────────────────────
export const paymentAPI = {
  createRazorpayOrder: (amount) => api.post('/payment/razorpay/create-order', { amount }),
  verifyRazorpay: (data) => api.post('/payment/razorpay/verify', data),
  getRazorpayKey: () => api.get('/payment/razorpay/key'),
  createStripeIntent: (amount) => api.post('/payment/stripe/create-intent', { amount }),
};

// ─── Banners API ──────────────────────────────────────────────────────────────
export const bannerAPI = {
  get: (position) => api.get('/banners', { params: { position } }),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/users', { params }),
  updateUserStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// ─── Upload API ───────────────────────────────────────────────────────────────
export const uploadAPI = {
  uploadProductImages: (formData) =>
    api.post('/upload/product', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadAvatar: (formData) =>
    api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (publicId) => api.delete(`/upload/product/${publicId}`),
};

export default api;
