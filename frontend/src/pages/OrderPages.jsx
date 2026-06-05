import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle, Package, Truck, ArrowRight, Home, Star,
} from 'lucide-react';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const formatPrice = (p) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(p || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

const STATUS_COLORS = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  processing:       'bg-purple-100 text-purple-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
};

// ─── OrderSuccess ──────────────────────────────────────────────────────────────
export function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="page-container py-20 text-center max-w-lg mx-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-display text-3xl font-bold text-saree-charcoal mb-2">
          Order Placed! 🎉
        </h1>
        <p className="text-gray-500 mb-2">Your beautiful sarees are on their way</p>
        <p className="text-xs text-gray-400 mb-8">
          Order ID: <span className="font-mono font-semibold text-saree-charcoal">{id}</span>
        </p>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {[
            { icon: Package, text: 'Confirmed', active: true },
            { icon: Truck, text: 'Shipped', active: false },
            { icon: CheckCircle, text: 'Delivered', active: false },
          ].map(({ icon: Icon, text, active }) => (
            <div
              key={text}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl ${active ? 'bg-green-50' : 'bg-gray-50'}`}
            >
              <Icon size={20} className={active ? 'text-green-500' : 'text-gray-300'} />
              <span className={`text-xs font-semibold ${active ? 'text-green-600' : 'text-gray-400'}`}>
                {text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link to={`/orders/${id}`} className="btn-primary gap-2 px-6 py-3">
            <Package size={15} /> Track Order
          </Link>
          <Link to="/" className="btn-secondary gap-2 px-6 py-3">
            <Home size={15} /> Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Orders ────────────────────────────────────────────────────────────────────
export function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderAPI.getMyOrders().then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  const orders = data?.orders || [];

  return (
    <>
      <Helmet><title>My Orders | SareeSaanvi</title></Helmet>
      <div className="page-container py-10 max-w-3xl">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-saree-charcoal mb-8">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="font-display text-xl text-gray-400 mb-2">No orders yet</h3>
            <Link to="/collections" className="btn-primary mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs font-semibold ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="font-bold text-saree-rose">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="flex gap-3 flex-wrap">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img key={i} src={item.image} alt={item.name} className="w-14 h-16 rounded-xl object-cover" />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-14 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-semibold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-secondary py-2 px-4 text-sm flex-shrink-0"
                  >
                    View Details <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── OrderDetail ───────────────────────────────────────────────────────────────
export function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getOne(id).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  const order = data?.order;

  if (!order) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-gray-400 text-xl">Order not found</h2>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Order #{order.orderNumber} | SareeSaanvi</title></Helmet>
      <div className="page-container py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/orders" className="text-gray-400 hover:text-saree-rose text-sm transition-colors">
            ← My Orders
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-saree-charcoal">
              Order #{order.orderNumber}
            </h1>
            <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`badge text-sm font-semibold px-4 py-2 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="space-y-4">
          {/* Items */}
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <h2 className="font-semibold text-saree-charcoal mb-3">Items Ordered</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-saree-charcoal line-clamp-2">{item.name}</p>
                    {item.color && <p className="text-xs text-gray-400">Color: {item.color}</p>}
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-saree-rose mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address + Payment */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h2 className="font-semibold text-saree-charcoal mb-3">Delivery Address</h2>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-semibold text-saree-charcoal">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.pincode}</p>
                <p className="mt-1">📞 {order.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-card">
              <h2 className="font-semibold text-saree-charcoal mb-3">Payment Summary</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span><span>{formatPrice(order.taxPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-saree-rose">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
              <p className={`mt-3 text-xs font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                {order.isPaid ? `✅ Paid on ${formatDate(order.paidAt)}` : '⏳ Payment Pending'}
              </p>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-saree-blush rounded-2xl p-5 flex items-center gap-3">
              <Truck size={20} className="text-saree-rose flex-shrink-0" />
              <div>
                <p className="font-semibold text-saree-charcoal text-sm">
                  Tracking: {order.trackingNumber}
                </p>
                {order.shippingCarrier && (
                  <p className="text-xs text-gray-500">{order.shippingCarrier}</p>
                )}
              </div>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto btn-secondary py-1.5 px-3 text-xs"
                >
                  Track
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderSuccess;
