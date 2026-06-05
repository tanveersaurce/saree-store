import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, Mail, ArrowLeft, CheckCircle,
  Lock, Eye, EyeOff,
} from 'lucide-react';
import { wishlistAPI, authAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ─── Wishlist ──────────────────────────────────────────────────────────────────
export function Wishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  const items = data?.wishlist || [];

  return (
    <>
      <Helmet><title>My Wishlist | SareeSaanvi</title></Helmet>
      <div className="page-container py-10">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-saree-charcoal mb-8 flex items-center gap-2">
          <Heart size={24} className="text-saree-rose" fill="currentColor" />
          My Wishlist
          {items.length > 0 && <span className="text-saree-rose">({items.length})</span>}
        </h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-display text-xl text-gray-400 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mb-6">Save sarees you love and come back to them anytime</p>
            <Link to="/collections" className="btn-primary">Browse Collections</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {items.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── ForgotPassword ────────────────────────────────────────────────────────────
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      // error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-saree flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-gray-500 text-sm hover:text-saree-rose mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Back to login
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-saree-charcoal mb-2">Email Sent!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Check your inbox for the password reset link. It expires in 15 minutes.
              </p>
              <Link to="/login" className="btn-primary w-full py-3 block text-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-saree-charcoal mb-1">
                Forgot Password?
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="input-field pl-11"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── ResetPassword ─────────────────────────────────────────────────────────────
export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-saree flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-card p-8">
          <h1 className="font-display text-2xl font-bold text-saree-charcoal mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-6">Choose a new strong password</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'New Password', field: 'password', showToggle: true },
              { label: 'Confirm Password', field: 'confirm', showToggle: false },
            ].map(({ label, field, showToggle }) => (
              <div key={field}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="input-field pl-11 pr-11"
                    required
                  />
                  {showToggle && (
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── NotFound ──────────────────────────────────────────────────────────────────
export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-saree flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-display font-bold text-gradient-brand mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-saree-charcoal mb-2">
          Page not found
        </h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary px-8 py-3.5 text-base">
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default Wishlist;
