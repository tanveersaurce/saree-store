import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const FABRICS = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Net', 'Banarasi', 'Tussar', 'Organza', 'Crepe', 'Linen'];
const OCCASIONS = ['Wedding', 'Festival', 'Party', 'Casual', 'Office', 'Bridal', 'Puja', 'Traditional'];
const PRICE_RANGES = [
  { label: 'Under ₹5,000', min: 0, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 – ₹20,000', min: 10000, max: 20000 },
  { label: '₹20,000 – ₹50,000', min: 20000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: 999999 },
];
const RATINGS = [4, 3, 2];

const FilterAccordion = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-saree-charcoal mb-3"
        onClick={() => setOpen(!open)}
      >
        {title}
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductList() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);

  const keyword  = searchParams.get('q') || '';
  const sort     = searchParams.get('sort') || 'newest';
  const page     = parseInt(searchParams.get('page') || '1');
  const fabrics  = searchParams.get('fabric')?.split(',').filter(Boolean) || [];
  const occasions= searchParams.get('occasion')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating= searchParams.get('minRating') || '';
  const filterFlag = searchParams.get('filter') || '';

  const formatCategoryName = (slug) => slug?.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || 'All Collections';

  const params = {
    ...(keyword && { keyword }),
    ...(category && { category: formatCategoryName(category) }),
    ...(fabrics.length && { fabric: fabrics.join(',') }),
    ...(occasions.length && { occasion: occasions.join(',') }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(minRating && { minRating }),
    ...(filterFlag === 'new' && { isNewArrival: true }),
    ...(filterFlag === 'bestseller' && { isBestSeller: true }),
    sort, page, limit: 12,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productAPI.getAll(params).then((r) => r.data),
    keepPreviousData: true,
  });

  const setParam = useCallback((key, value) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (value) p.set(key, value); else p.delete(key);
      p.delete('page');
      return p;
    });
  }, [setSearchParams]);

  const toggleArray = useCallback((key, val, current) => {
    const arr = current.includes(val) ? current.filter((v) => v !== val) : [...current, val];
    setParam(key, arr.join(','));
  }, [setParam]);

  const setPriceRange = (min, max) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (min === 0 && max === 999999) { p.delete('minPrice'); p.delete('maxPrice'); }
      else { p.set('minPrice', min); p.set('maxPrice', max); }
      p.delete('page');
      return p;
    });
  };

  const clearAll = () => setSearchParams({});

  const hasFilters = fabrics.length || occasions.length || minPrice || minRating;

  const FiltersContent = () => (
    <div className="space-y-1">
      {hasFilters > 0 && (
        <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-red-500 font-medium hover:underline mb-2">
          <X size={12} /> Clear all filters
        </button>
      )}

      <FilterAccordion title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map(({ label, min, max }) => {
            const active = String(min) === minPrice && String(max) === maxPrice;
            return (
              <button key={label} onClick={() => active ? setPriceRange('', '') : setPriceRange(min, max)}
                className={`flex items-center gap-2 w-full text-sm py-1 ${active ? 'text-saree-rose font-semibold' : 'text-gray-600 hover:text-saree-rose'}`}
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${active ? 'bg-saree-rose border-saree-rose' : 'border-gray-300'}`}>
                  {active && <span className="w-2 h-2 bg-white rounded-sm" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Fabric">
        <div className="space-y-2">
          {FABRICS.map((fab) => (
            <label key={fab} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={fabrics.includes(fab)} onChange={() => toggleArray('fabric', fab, fabrics)}
                className="w-4 h-4 rounded border-gray-300 text-saree-rose focus:ring-saree-rose accent-pink-600" />
              <span className={`text-sm ${fabrics.includes(fab) ? 'text-saree-rose font-medium' : 'text-gray-600 group-hover:text-saree-rose'}`}>{fab}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Occasion">
        <div className="space-y-2">
          {OCCASIONS.map((occ) => (
            <label key={occ} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={occasions.includes(occ)} onChange={() => toggleArray('occasion', occ, occasions)}
                className="w-4 h-4 rounded border-gray-300 text-saree-rose focus:ring-saree-rose accent-pink-600" />
              <span className={`text-sm ${occasions.includes(occ) ? 'text-saree-rose font-medium' : 'text-gray-600 group-hover:text-saree-rose'}`}>{occ}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Customer Rating">
        <div className="space-y-2">
          {RATINGS.map((r) => (
            <button key={r} onClick={() => setParam('minRating', minRating == r ? '' : r)}
              className={`flex items-center gap-2 w-full text-sm py-1 ${minRating == r ? 'text-saree-rose font-semibold' : 'text-gray-600 hover:text-saree-rose'}`}>
              <span className="flex">
                {[1,2,3,4,5].map((s) => <span key={s} className={`text-base ${s <= r ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
              </span>
              <span>& up</span>
            </button>
          ))}
        </div>
      </FilterAccordion>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{category ? `${formatCategoryName(category)} | SareeSaanvi` : keyword ? `"${keyword}" | SareeSaanvi` : 'All Collections | SareeSaanvi'}</title>
      </Helmet>

      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-saree-charcoal">
            {keyword ? `Search: "${keyword}"` : category ? formatCategoryName(category) : 'All Collections'}
          </h1>
          {data?.pagination && (
            <p className="text-gray-400 text-sm mt-1">{data.pagination.total} sarees found</p>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-card">
              <h2 className="font-display font-bold text-saree-charcoal text-lg mb-4">Filters</h2>
              <FiltersContent />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 btn-secondary py-2 px-4 text-sm"
              >
                <SlidersHorizontal size={15} />
                Filters
                {hasFilters > 0 && <span className="w-5 h-5 bg-saree-rose text-white text-xs rounded-full flex items-center justify-center">{typeof hasFilters === 'boolean' ? '!' : hasFilters}</span>}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sort}
                  onChange={(e) => setParam('sort', e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-saree-rose bg-white text-gray-700"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                <div className="hidden sm:flex gap-1 bg-gray-100 rounded-lg p-1">
                  {[3, 2].map((cols) => (
                    <button key={cols} onClick={() => setGridCols(cols)}
                      className={`p-1.5 rounded-md transition-colors ${gridCols === cols ? 'bg-white shadow-sm text-saree-rose' : 'text-gray-400 hover:text-gray-600'}`}>
                      {cols === 3 ? <Grid3X3 size={15} /> : <LayoutList size={15} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {(fabrics.length > 0 || occasions.length > 0 || minPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {fabrics.map((f) => (
                  <span key={f} className="flex items-center gap-1.5 bg-saree-blush text-saree-rose text-xs px-3 py-1.5 rounded-full font-medium">
                    {f} <button onClick={() => toggleArray('fabric', f, fabrics)}><X size={11} /></button>
                  </span>
                ))}
                {occasions.map((o) => (
                  <span key={o} className="flex items-center gap-1.5 bg-saree-blush text-saree-rose text-xs px-3 py-1.5 rounded-full font-medium">
                    {o} <button onClick={() => toggleArray('occasion', o, occasions)}><X size={11} /></button>
                  </span>
                ))}
                {minPrice && <span className="flex items-center gap-1.5 bg-saree-blush text-saree-rose text-xs px-3 py-1.5 rounded-full font-medium">
                  Price filter <button onClick={() => setPriceRange('', '')}><X size={11} /></button>
                </span>}
              </div>
            )}

            {/* Products */}
            {isLoading ? (
              <div className={`grid gap-4 sm:gap-5 grid-cols-2 ${gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="skeleton aspect-card" />
                    <div className="p-3.5 space-y-2">
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-4 w-4/5 rounded" />
                      <div className="skeleton h-4 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.products?.length === 0 ? (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="font-display text-xl font-semibold text-gray-400 mb-2">No sarees found</h3>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search term</p>
                <button onClick={clearAll} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 sm:gap-5 grid-cols-2 ${gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} ${isFetching ? 'opacity-70' : ''} transition-opacity`}>
                  {data?.products?.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      disabled={page <= 1}
                      onClick={() => setParam('page', page - 1)}
                      className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(data.pagination.pages, 7) }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setParam('page', p)}
                          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${p === page ? 'bg-saree-rose text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-saree-rose hover:text-saree-rose'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={page >= data.pagination.pages}
                      onClick={() => setParam('page', page + 1)}
                      className="btn-secondary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileFiltersOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
              </div>
              <FiltersContent />
              <button onClick={() => setMobileFiltersOpen(false)} className="btn-primary w-full mt-6">Apply Filters</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
