import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Package, Star, ChevronDown } from 'lucide-react';
import { productAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p || 0);

const CATEGORIES = ['Silk Sarees','Cotton Sarees','Designer Sarees','Bridal Sarees','Casual Sarees','Party Wear','Handloom Sarees','Georgette Sarees','Chiffon Sarees','Net Sarees','Banarasi Sarees','Kanjivaram Sarees','Chanderi Sarees','Tussar Sarees','Patola Sarees'];
const FABRICS = ['Silk','Cotton','Georgette','Chiffon','Net','Satin','Linen','Banarasi','Tussar','Organza','Crepe','Velvet','Brocade','Mixed'];
const PRINT_TECHNIQUES = [
  'Bagru',
  'Batik',
  'Dabu',
  'Zari-Zardozi',
  'Ajrakh',
  'Bandhani',
  'Leheriya',
  'Kalamkari',
  'Block Print',
  'Ikat',
  'Shibori'
];
const OCCASIONS_LIST = ['Wedding','Festival','Party','Casual','Office','Bridal','Puja','Sangeet','Reception','Traditional'];

const EMPTY_PRODUCT = {
  name: '', description: '', shortDescription: '', price: '', discountPrice: '', category: '', fabric: '', printTechnique: [], occasion: [],
  stock: '', weight: 500, sareeLength: 5.5, blouseLength: 0.8, blouseIncluded: false,
  careInstructions: 'Dry clean only', tags: '', brand: 'SareeSaanvi Original', origin: 'India',
  isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false, isActive: true,
  images: [{ public_id: 'placeholder', url: '', alt: '', isMain: true }],
};

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productAPI.getAll({ keyword: search, page, limit: 15, admin: true }).then((r) => r.data),
    keepPreviousData: true,
  });

  const openCreate = () => { setEditProduct(null); setForm(EMPTY_PRODUCT); setShowForm(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      ...p,
      price: p.price || '',
      discountPrice: p.discountPrice || '',
      stock: p.stock || '',
      tags: (p.tags || []).join(', '),
      occasion: Array.isArray(p.occasion) ? p.occasion : [], // ← fix: always ensure array
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category || !form.fabric) { toast.error('Fill in all required fields'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: +form.price,
        discountPrice: form.discountPrice ? +form.discountPrice : undefined,
        stock: +form.stock,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        occasion: Array.isArray(form.occasion) ? form.occasion : [], // ← fix: safe occasion
        printTechniques: Array.isArray(form.printTechniques) ? form.printTechniques : [],
      };
      if (editProduct) {
        await productAPI.update(editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product created!');
      }
      qc.invalidateQueries(['admin-products']);
      setShowForm(false);
    } catch {}
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted!');
      qc.invalidateQueries(['admin-products']);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ← fix: safely handle occasion toggle even if it's undefined
  const toggleOccasion = (occ) => {
    const current = Array.isArray(form.occasion) ? form.occasion : [];
    set('occasion', current.includes(occ) ? current.filter((o) => o !== occ) : [...current, occ]);
  };

  return (
    <>
      <Helmet><title>Products | Admin</title></Helmet>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-saree-charcoal">Products</h1>
            <p className="text-gray-400 text-sm">{data?.pagination?.total || 0} total products</p>
          </div>
          <button onClick={openCreate} className="btn-primary gap-2 py-2.5"><Plus size={15} /> Add Product</button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..." className="input-field pl-9 py-2.5 text-sm" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {isLoading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.products?.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]?.url} alt={product.name} className="w-12 h-14 rounded-xl object-cover flex-shrink-0 bg-saree-blush" />
                          <div className="min-w-0">
                            <p className="font-medium text-saree-charcoal line-clamp-1">{product.name}</p>
                            <p className="text-gray-400 text-xs">{product.fabric}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={10} className="text-amber-400" fill="currentColor" />
                              <span className="text-xs text-gray-400">{product.ratings} ({product.numReviews})</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="badge bg-saree-blush text-saree-rose text-xs">{product.category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-saree-rose">{formatPrice(product.discountPrice || product.price)}</p>
                        {product.discountPrice && <p className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge text-xs font-semibold ${product.stock === 0 ? 'bg-red-100 text-red-600' : product.stock <= 10 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                          {product.stock === 0 ? 'Out of Stock' : product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {product.isFeatured && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full w-fit">Featured</span>}
                          {product.isTrending && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full w-fit">Trending</span>}
                          {product.isNewArrival && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full w-fit">New</span>}
                          {!product.isFeatured && !product.isTrending && !product.isNewArrival && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full w-fit">Standard</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors"><Eye size={14} /></a>
                          <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-saree-rose transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(product._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.products?.length === 0 && (
                <div className="text-center py-12">
                  <Package size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400">No products found</p>
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

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-saree-charcoal">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">✕</button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Image URL quick input */}
              <div>
                <label className="input-label">Main Image URL</label>
                <input type="url" value={form.images?.[0]?.url || ''} onChange={(e) => set('images', [{ ...form.images[0], url: e.target.value }])} placeholder="https://..." className="input-field" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">Product Name *</label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" placeholder="e.g. Kanjivaram Silk Saree - Royal Gold" />
                </div>
                <div>
                  <label className="input-label">Category *</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input-field">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Fabric *</label>
                  <select value={form.fabric} onChange={(e) => set('fabric', e.target.value)} className="input-field">
                    <option value="">Select fabric</option>
                    {FABRICS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} className="input-field" placeholder="e.g. 15000" />
                </div>
                <div>
                  <label className="input-label">Sale Price (₹)</label>
                  <input type="number" value={form.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} className="input-field" placeholder="e.g. 12000" />
                </div>
                <div>
                  <label className="input-label">Stock Quantity *</label>
                  <input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input-field" placeholder="e.g. 25" />
                </div>
                <div>
                  <label className="input-label">Origin</label>
                  <input type="text" value={form.origin} onChange={(e) => set('origin', e.target.value)} className="input-field" placeholder="e.g. Kanchipuram, TN" />
                </div>
              </div>

              <div>
                <label className="input-label">Short Description</label>
                <input type="text" value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} className="input-field" placeholder="One-liner summary (shown in listings)" />
              </div>

              <div>
                <label className="input-label">Description *</label>
                <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field resize-none" placeholder="Full product description..." />
              </div>

              <div>
                <label className="input-label">Occasions</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS_LIST.map((occ) => (
                    <button key={occ} type="button" onClick={() => toggleOccasion(occ)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        Array.isArray(form.occasion) && form.occasion.includes(occ)
                          ? 'bg-saree-rose text-white border-saree-rose'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-saree-rose'
                      }`}>
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Print Techniques</label>
                <div className="flex flex-wrap gap-2">
                  {PRINT_TECHNIQUES.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(form.printTechniques) ? form.printTechniques : [];
                        set('printTechniques', current.includes(pt)
                          ? current.filter((x) => x !== pt)
                          : [...current, pt]);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        Array.isArray(form.printTechniques) && form.printTechniques.includes(pt)
                          ? 'bg-saree-rose text-white border-saree-rose'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-saree-rose'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>


              <div>
                <label className="input-label">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)} className="input-field" placeholder="silk, bridal, gold, zari" />
              </div>

              <div className="flex flex-wrap gap-4">
                {[['isFeatured', 'Featured'], ['isTrending', 'Trending'], ['isNewArrival', 'New Arrival'], ['isBestSeller', 'Best Seller'], ['blouseIncluded', 'Blouse Included']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} className="w-4 h-4 rounded accent-pink-600" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary py-2.5 px-5">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-6">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
