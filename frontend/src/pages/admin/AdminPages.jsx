import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, Eye, Package, Plus, Trash2, Edit2, Image,
} from 'lucide-react';
import { orderAPI, bannerAPI, adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'processing',
  'shipped', 'out_for_delivery', 'delivered', 'cancelled',
];

// ─── Admin Orders ──────────────────────────────────────────────────────────────
export function AdminOrders() {
  const qc = useQueryClient();
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus]     = useState('');
  const [tracking, setTracking]       = useState('');
  const [updating, setUpdating]       = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, page, statusFilter],
    queryFn: () =>
      orderAPI.getAll({ search, page, limit: 15, status: statusFilter }).then((r) => r.data),
    keepPreviousData: true,
  });

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await orderAPI.updateStatus(selectedOrder._id, {
        status: newStatus, trackingNumber: tracking,
      });
      qc.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
      setSelectedOrder(null);
    } catch (err) {
      // handled by interceptor
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Helmet><title>Orders | Admin</title></Helmet>
      <div className="space-y-5">

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-saree-charcoal">Orders</h1>
            <p className="text-gray-400 text-sm">
              Revenue: {formatPrice(data?.stats?.totalRevenue)} · {data?.pagination?.total || 0} orders
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by order #..."
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field py-2.5 text-sm w-auto"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {isLoading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.orders || []).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs font-semibold text-saree-charcoal">#{order.orderNumber}</p>
                        <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-saree-charcoal">{order.user?.name}</p>
                        <p className="text-gray-400 text-xs truncate max-w-[140px]">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          {order.items.slice(0, 2).map((item, i) => (
                            <img key={i} src={item.image} alt="" className="w-8 h-10 rounded-lg object-cover" />
                          ))}
                          {order.items.length > 2 && (
                            <div className="w-8 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              +{order.items.length - 2}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-saree-rose">{formatPrice(order.totalPrice)}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-xs ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-xs capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setTracking(order.trackingNumber || '');
                          }}
                          className="p-1.5 rounded-lg hover:bg-saree-blush text-gray-400 hover:text-saree-rose transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(data?.orders?.length === 0) && (
                <div className="text-center py-12">
                  <Package size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400">No orders found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination?.pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${p === page ? 'bg-saree-rose text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-saree-rose'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status update modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold text-saree-charcoal mb-4">
              Update Order #{selectedOrder.orderNumber}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="input-label">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Tracking Number</label>
                <input
                  type="text" value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  className="input-field" placeholder="e.g. IND12345678901"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={updating} className="btn-primary flex-1 py-2.5">
                {updating
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Admin Users ───────────────────────────────────────────────────────────────
export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminAPI.getUsers({ search, page, limit: 20 }).then((r) => r.data),
    keepPreviousData: true,
  });

  return (
    <>
      <Helmet><title>Customers | Admin</title></Helmet>
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-saree-charcoal">Customers</h1>
          <p className="text-gray-400 text-sm">{data?.total || 0} registered users</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search customers..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {isLoading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Customer', 'Email', 'Phone', 'Role', 'Orders', 'Joined', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.users || []).map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-saree-rose to-saree-crimson flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <p className="font-medium text-saree-charcoal">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">{user.email}</td>
                      <td className="px-4 py-3.5 text-gray-500">{user.phone || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-saree-blush text-saree-rose'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{user.totalOrders || 0}</td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-xs ${user.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.users?.length === 0 && (
                <div className="text-center py-12 text-gray-400">No customers found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Admin Banners ─────────────────────────────────────────────────────────────
export function AdminBanners() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '',
    image: { url: '' }, link: '/', buttonText: 'Shop Now',
    position: 'hero', order: 0, isActive: true,
    bgColor: '#2d1b3d', textColor: '#ffffff',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => bannerAPI.get().then((r) => r.data),
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await bannerAPI.create(form);
      qc.invalidateQueries(['admin-banners']);
      toast.success('Banner created!');
      setShowForm(false);
    } catch (err) {
      // handled
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await bannerAPI.delete(id);
      qc.invalidateQueries(['admin-banners']);
      toast.success('Banner deleted');
    } catch (err) {
      // handled
    }
  };

  return (
    <>
      <Helmet><title>Banners | Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-saree-charcoal">Banners</h1>
            <p className="text-gray-400 text-sm">Manage homepage hero banners</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary gap-2 py-2.5">
            <Plus size={15} /> Add Banner
          </button>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.banners || []).map((banner) => (
              <div key={banner._id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="relative h-40 bg-gray-100">
                  {banner.image?.url
                    ? <img src={banner.image.url} alt={banner.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Image size={32} className="text-gray-300" /></div>
                  }
                  <span className={`absolute top-2 right-2 badge text-xs ${banner.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-saree-charcoal text-sm">{banner.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{banner.subtitle}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="badge bg-saree-blush text-saree-rose text-xs capitalize">{banner.position}</span>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {data?.banners?.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400">No banners yet</div>
            )}
          </div>
        )}
      </div>

      {/* Create banner modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-saree-charcoal">Add Banner</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">✕</button>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {[
                ['Title',        'title',       'e.g. New Bridal Collection'],
                ['Subtitle',     'subtitle',    'e.g. Crafted for Your Moment'],
                ['Description',  'description', 'Short banner description'],
                ['Link',         'link',        '/collections/bridal-sarees'],
                ['Button Text',  'buttonText',  'Shop Now'],
              ].map(([label, field, ph]) => (
                <div key={field}>
                  <label className="input-label">{label}</label>
                  <input
                    type="text" value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    placeholder={ph} className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="input-label">Image URL</label>
                <input
                  type="url" value={form.image?.url}
                  onChange={(e) => set('image', { url: e.target.value })}
                  placeholder="https://..." className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Position</label>
                  <select value={form.position} onChange={(e) => set('position', e.target.value)} className="input-field">
                    <option value="hero">Hero</option>
                    <option value="middle">Middle</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Order</label>
                  <input type="number" value={form.order} onChange={(e) => set('order', +e.target.value)} className="input-field" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 rounded accent-pink-600" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Create Banner'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default AdminOrders;
