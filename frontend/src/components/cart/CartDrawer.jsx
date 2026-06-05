import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCartStore, useUIStore, useAuthStore } from '../../context/store';

const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function CartDrawer() {
  const navigate = useNavigate();
  const { cartOpen, closeCart } = useUIStore();
  const { items, total, itemCount, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const shipping = total >= 999 ? 0 : 99;
  const tax = Math.round(total * 0.05);
  const grandTotal = total + shipping + tax;

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-saree-rose" />
                <h2 className="font-display text-xl font-bold text-saree-charcoal">My Bag</h2>
                {itemCount > 0 && (
                  <span className="w-6 h-6 bg-saree-rose text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 bg-saree-blush rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-saree-rose/50" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-saree-charcoal mb-1">Your bag is empty</h3>
                    <p className="text-gray-400 text-sm">Add some beautiful sarees to get started</p>
                  </div>
                  <button onClick={() => { closeCart(); navigate('/collections'); }} className="btn-primary">
                    Browse Collections
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 bg-saree-blush/50 rounded-2xl p-3"
                  >
                    {/* Image */}
                    <Link to={`/product/${item.product?.slug}`} onClick={closeCart}>
                      <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                        <img
                          src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80x96'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?.slug}`} onClick={closeCart}>
                        <h4 className="font-semibold text-saree-charcoal text-sm line-clamp-2 leading-snug hover:text-saree-rose transition-colors">
                          {item.name}
                        </h4>
                      </Link>
                      {item.color && (
                        <p className="text-gray-400 text-xs mt-0.5">Color: {item.color}</p>
                      )}
                      <p className="text-saree-rose font-bold text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-saree-blush transition-colors text-gray-600"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-saree-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-saree-blush transition-colors text-gray-600"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary & Checkout */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100 bg-white space-y-4">
                {/* Free shipping notice */}
                {total < 999 && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                    <Package size={14} className="text-amber-500 flex-shrink-0" />
                    <p className="text-amber-700 text-xs">
                      Add <strong>{formatPrice(999 - total)}</strong> more for free shipping!
                    </p>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (5%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-saree-charcoal border-t border-gray-100 pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-saree-rose">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full text-base gap-2 py-3.5"
                >
                  Proceed to Checkout <ArrowRight size={16} />
                </button>

                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm text-gray-400 hover:text-saree-rose transition-colors"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
