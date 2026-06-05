import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Gift } from 'lucide-react';
import { useCartStore, useAuthStore } from '../context/store';

const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, itemCount, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [coupon, setCoupon] = useState('');

  const shipping = total >= 999 ? 0 : 99;
  const tax = Math.round(total * 0.05);
  const grandTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <Helmet><title>My Cart | SareeSaanvi</title></Helmet>
        <div className="w-24 h-24 bg-saree-blush rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-saree-rose/50" />
        </div>
        <h2 className="font-display text-2xl font-bold text-saree-charcoal mb-2">Your bag is empty</h2>
        <p className="text-gray-400 mb-8">Looks like you haven't added any sarees yet</p>
        <Link to="/collections" className="btn-primary px-8 py-3.5 text-base">Browse Collections</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>My Cart ({itemCount}) | SareeSaanvi</title></Helmet>
      <div className="page-container py-10">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-saree-charcoal mb-8">
          Shopping Bag <span className="text-saree-rose">({itemCount})</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div key={item._id} layout exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl p-4 shadow-card flex gap-4">
                <Link to={`/product/${item.product?.slug}`}>
                  <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-saree-blush">
                    <img src={item.product?.images?.[0]?.url} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link to={`/product/${item.product?.slug}`}>
                      <h3 className="font-semibold text-saree-charcoal text-sm leading-snug hover:text-saree-rose transition-colors line-clamp-2">{item.name}</h3>
                    </Link>
                    <button onClick={() => removeItem(item._id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {item.color && <p className="text-gray-400 text-xs mt-0.5">Color: {item.color}</p>}
                  <p className="text-saree-rose font-bold mt-2">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"><Minus size={12} /></button>
                      <span className="px-3 py-1.5 text-sm font-semibold min-w-[32px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600 transition-colors"><Plus size={12} /></button>
                    </div>
                    <span className="text-xs text-gray-400">Subtotal: <span className="font-semibold text-gray-700">{formatPrice(item.price * item.quantity)}</span></span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Coupon */}
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <p className="font-semibold text-sm text-saree-charcoal mb-3 flex items-center gap-2"><Tag size={14} className="text-saree-rose" /> Apply Coupon</p>
              <div className="flex gap-2">
                <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="input-field py-2 text-sm flex-1" />
                <button className="btn-secondary py-2 px-4 text-sm">Apply</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Try: SAANVI10 for 10% off your first order</p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-card sticky top-24">
              <h2 className="font-display text-lg font-bold text-saree-charcoal mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-gray-500"><span>Subtotal ({itemCount} items)</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>{formatPrice(tax)}</span></div>
              </div>
              <div className="flex justify-between font-bold text-lg text-saree-charcoal mb-5">
                <span>Total</span><span className="text-saree-rose">{formatPrice(grandTotal)}</span>
              </div>
              <button onClick={() => isAuthenticated ? navigate('/checkout') : navigate('/login?redirect=/checkout')} className="btn-primary w-full py-3.5 text-base">
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <Link to="/collections" className="block text-center text-sm text-gray-400 hover:text-saree-rose mt-3 transition-colors">Continue Shopping</Link>
            </div>

            {/* Gift option */}
            <div className="bg-saree-blush rounded-2xl p-4 flex items-center gap-3">
              <Gift size={18} className="text-saree-rose flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-saree-charcoal">Send as a Gift?</p>
                <p className="text-xs text-gray-500 mt-0.5">Add a personal message at checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
