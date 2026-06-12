import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p || 0);
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data.stats),
    refetchInterval: 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner />;

  const stats = data || {};

  const STAT_CARDS = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Total Orders', value: (stats.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Products', value: (stats.totalProducts || 0).toLocaleString(), icon: Package, color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Customers', value: (stats.totalUsers || 0).toLocaleString(), icon: Users, color: 'from-pink-400 to-rose-500', bg: 'bg-pink-50', iconColor: 'text-pink-600' },
  ];

  return (
    <>
      <Helmet><title>Admin Dashboard | Saaj</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-saree-charcoal">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, bg, iconColor }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm">{label}</p>
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={17} className={iconColor} />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-saree-charcoal">{value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue chart placeholder */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-saree-charcoal">Revenue Overview</h2>
              <TrendingUp size={16} className="text-saree-rose" />
            </div>
            <div className="space-y-2">
              {(stats.revenueByMonth || []).slice(-6).map((month, i) => {
                const max = Math.max(...(stats.revenueByMonth || [{ revenue: 1 }]).map((m) => m.revenue));
                const pct = max > 0 ? (month.revenue / max) * 100 : 0;
                const monthName = new Date(month._id.year, month._id.month - 1).toLocaleString('en-IN', { month: 'short' });
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-8">{monthName}</span>
                    <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-saree-rose to-saree-crimson rounded-lg flex items-center justify-end pr-2" style={{ minWidth: pct > 5 ? undefined : 0 }}>
                        {pct > 15 && <span className="text-white text-[10px] font-semibold">{formatPrice(month.revenue)}</span>}
                      </motion.div>
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{formatPrice(month.revenue)}</span>
                  </div>
                );
              })}
              {(!stats.revenueByMonth || stats.revenueByMonth.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>
              )}
            </div>
          </div>

          {/* Order status breakdown */}
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <h2 className="font-semibold text-saree-charcoal mb-4">Orders by Status</h2>
            <div className="space-y-2">
              {(stats.ordersByStatus || []).map(({ _id, count }) => (
                <div key={_id} className="flex items-center justify-between">
                  <span className={`badge text-xs capitalize ${STATUS_COLORS[_id] || 'bg-gray-100 text-gray-600'}`}>
                    {_id?.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-sm text-saree-charcoal">{count}</span>
                </div>
              ))}
              {(!stats.ordersByStatus || stats.ordersByStatus.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-saree-charcoal">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-saree-rose hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats.recentOrders || []).slice(0, 6).map((order) => (
                <div key={order._id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-saree-charcoal truncate">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.user?.name} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`badge text-[10px] capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>{order.status}</span>
                    <span className="text-sm font-semibold text-saree-rose">{formatPrice(order.totalPrice)}</span>
                    <Link to={`/admin/orders?id=${order._id}`}><Eye size={14} className="text-gray-300 hover:text-saree-rose" /></Link>
                  </div>
                </div>
              ))}
              {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-10">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low stock */}
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-saree-charcoal flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500" /> Low Stock Alert
              </h2>
              <Link to="/admin/products" className="text-xs text-saree-rose hover:underline">Manage →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats.lowStockProducts || []).map((product) => (
                <div key={product._id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-saree-charcoal truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                  <span className={`badge text-xs font-bold ${product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
              {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-10">All products well stocked ✓</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
