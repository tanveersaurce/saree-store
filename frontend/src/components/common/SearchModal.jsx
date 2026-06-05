import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { productAPI } from '../../services/api';
import { useUIStore } from '../../context/store';

const TRENDING = ['Kanjivaram Silk', 'Bridal Sarees', 'Banarasi', 'Designer Georgette', 'Cotton Handloom'];
const RECENT_KEY = 'saree_recent_searches';

export default function SearchModal() {
  const navigate = useNavigate();
  const { closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  });
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await productAPI.getSuggestions(query);
        setSuggestions(data.suggestions || []);
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (q) => {
    const term = (q || query).trim();
    if (!term) return;
    const newRecent = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(newRecent);
    localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
        onClick={(e) => e.target === e.currentTarget && closeSearch()}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Search size={20} className="text-saree-rose flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search sarees, fabrics, occasions..."
              className="flex-1 text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            )}
            <button onClick={closeSearch} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors ml-1">
              <X size={20} />
            </button>
          </div>

          {/* Suggestions */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-saree-rose border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="py-3">
                <p className="px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Products</p>
                {suggestions.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => { closeSearch(); navigate(`/product/${product.slug}`); }}
                    className="flex items-center gap-3 w-full px-5 py-3 hover:bg-saree-blush transition-colors text-left"
                  >
                    <img src={product.images?.[0]?.url} alt={product.name} className="w-10 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="text-sm font-medium text-saree-charcoal line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-gray-300" />
                  </button>
                ))}
                <button
                  onClick={() => handleSearch()}
                  className="flex items-center gap-2 w-full px-5 py-3 text-sm font-semibold text-saree-rose hover:bg-saree-blush transition-colors border-t border-gray-100"
                >
                  <Search size={14} />
                  View all results for "{query}"
                </button>
              </div>
            )}

            {!loading && !query && (
              <div className="py-4 space-y-4">
                {recent.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-5 mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock size={12} /> Recent Searches
                      </p>
                      <button onClick={clearRecent} className="text-xs text-saree-rose hover:underline">Clear</button>
                    </div>
                    {recent.map((term) => (
                      <button key={term} onClick={() => handleSearch(term)} className="flex items-center gap-3 w-full px-5 py-2.5 hover:bg-saree-blush transition-colors text-left">
                        <Clock size={14} className="text-gray-300" />
                        <span className="text-sm text-gray-600">{term}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <p className="px-5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <TrendingUp size={12} /> Trending
                  </p>
                  <div className="px-5 flex flex-wrap gap-2 pb-4">
                    {TRENDING.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 bg-saree-blush text-saree-rose text-sm rounded-full hover:bg-saree-rose hover:text-white transition-colors font-medium"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
