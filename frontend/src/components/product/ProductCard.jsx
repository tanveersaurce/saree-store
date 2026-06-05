import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye, Zap } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '../../context/store';
import toast from 'react-hot-toast';

const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const wishlisted = isWishlisted(product._id);
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Saree';
  const hoverImage = product.images?.[1]?.url || mainImage;
  const effectivePrice = product.discountPrice || product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-card overflow-hidden bg-saree-blush">
          <img
            src={hovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 ease-out"
            style={{ transform: hovered ? 'scale(1.07)' : 'scale(1)' }}
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.discountPercent > 0 && (
              <span className="badge-sale font-bold text-[11px]">-{product.discountPercent}%</span>
            )}
            {product.isNewArrival && (
              <span className="badge-new text-[11px]">New</span>
            )}
            {product.isTrending && (
              <span className="badge-trending text-[11px]">Trending</span>
            )}
            {product.isBestSeller && (
              <span className="badge-bestseller text-[11px]">Best Seller</span>
            )}
          </div>

          {/* Actions overlay */}
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-3 right-3 flex gap-2"
          >
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/95 backdrop-blur-sm rounded-xl text-saree-rose font-semibold text-xs shadow-lg hover:bg-saree-rose hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              {adding ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingBag size={13} />
              )}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
          </motion.div>

          {/* Wishlist btn */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
              wishlisted
                ? 'bg-saree-rose text-white scale-110'
                : 'bg-white/90 text-gray-400 hover:text-saree-rose hover:bg-white'
            }`}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-center py-1 text-[10px] font-semibold">
              Only {product.stock} left!
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          {/* Category & fabric */}
          <p className="text-gray-400 text-[11px] uppercase tracking-wide mb-1">
            {product.fabric} · {product.category}
          </p>

          {/* Name */}
          <h3 className="font-display font-semibold text-saree-charcoal text-sm leading-snug line-clamp-2 mb-2 group-hover:text-saree-rose transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    className={s <= Math.round(product.ratings) ? 'star-filled' : 'star-empty'}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-gray-400 text-[11px]">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="price-discount">{formatPrice(effectivePrice)}</span>
            {product.discountPrice && (
              <span className="price-original">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
