import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, ShoppingBag, Star, Truck, Shield, RotateCcw,
  ChevronLeft, ChevronRight, Share2, Check, ChevronDown, Minus, Plus
} from 'lucide-react';
import { productAPI } from '../services/api';
import { useCartStore, useWishlistStore } from '../context/store';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function ProductDetail() {
  const { slug } = useParams();
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [expandedSection, setExpandedSection] = useState('description');
  const [adding, setAdding] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');

  const { addToCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getOne(slug).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (error || !data?.product) return (
    <div className="page-container py-20 text-center">
      <h2 className="font-display text-2xl text-gray-400 mb-4">Product not found</h2>
      <Link to="/collections" className="btn-primary">Browse Collections</Link>
    </div>
  );

  const { product, reviews, related } = data;
  const images = product.images?.length ? product.images : [{ url: 'https://via.placeholder.com/600x750', alt: product.name }];
  const effectivePrice = product.discountPrice || product.price;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product._id, quantity, selectedColor);
    setAdding(false);
  };

  const checkPincode = () => {
    if (pincode.length !== 6) { toast.error('Enter a valid 6-digit pincode'); return; }
    // Simulate delivery check
    setPincodeMsg('✅ Delivery available in 5–7 business days');
  };

  const AccordionSection = ({ id, title, children }) => (
    <div className="border-b border-gray-100">
      <button
        className="flex items-center justify-between w-full py-4 text-sm font-semibold text-saree-charcoal hover:text-saree-rose transition-colors"
        onClick={() => setExpandedSection(expandedSection === id ? '' : id)}
      >
        {title}
        <ChevronDown size={16} className={`transition-transform ${expandedSection === id ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{product.name} | SareeSaanvi</title>
        <meta name="description" content={product.shortDescription || product.description?.slice(0, 160)} />
      </Helmet>

      <div className="page-container py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-saree-rose">Home</Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-saree-rose">Collections</Link>
          <span>/</span>
          <Link to={`/collections/${product.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-saree-rose">{product.category}</Link>
          <span>/</span>
          <span className="text-saree-charcoal line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-saree-blush group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]?.url}
                  alt={images[activeImg]?.alt || product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setActiveImg((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Wishlist + Share */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button onClick={() => toggle(product._id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-saree-rose text-white' : 'bg-white/90 text-gray-400 hover:text-saree-rose'}`}>
                  <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => { navigator.share?.({ title: product.name, url: window.location.href }) || navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!')); }}
                  className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white text-gray-400 hover:text-saree-rose transition-colors">
                  <Share2 size={15} />
                </button>
              </div>

              {/* Discount badge */}
              {product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 badge-sale font-bold">{product.discountPercent}% OFF</div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-saree-rose' : 'border-transparent hover:border-gray-200'}`}>
                    <img src={img.url} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <p className="text-xs uppercase tracking-widest text-saree-gold font-semibold mb-1">{product.fabric} · {product.category}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-saree-charcoal leading-tight">{product.name}</h1>
              <p className="font-accent text-gray-500 italic text-sm mt-1">{product.brand} · {product.origin}</p>
            </div>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={16} className={s <= Math.round(product.ratings) ? 'text-amber-400' : 'text-gray-200'} fill="currentColor" />
                  ))}
                </div>
                <span className="font-semibold text-sm text-gray-700">{product.ratings}</span>
                <span className="text-gray-400 text-sm">({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-bold text-saree-rose">{formatPrice(effectivePrice)}</span>
              {product.discountPrice && (
                <span className="text-gray-400 line-through text-lg">{formatPrice(product.price)}</span>
              )}
              {product.discountPercent > 0 && (
                <span className="badge-sale text-sm font-bold">Save {formatPrice(product.price - product.discountPrice)}</span>
              )}
            </div>
            <p className="text-xs text-gray-400">Inclusive of all taxes · GST included</p>

            {/* Color variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-saree-charcoal mb-2">Color: <span className="text-gray-500 font-normal">{selectedColor || 'Select a color'}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v) => (
                    <button key={v._id} onClick={() => setSelectedColor(v.color)}
                      title={v.color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === v.color ? 'border-saree-rose scale-110 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ backgroundColor: v.colorHex }}>
                      {selectedColor === v.color && <Check size={12} className="mx-auto text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-saree-charcoal mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 hover:bg-gray-50 transition-colors text-gray-600"><Minus size={14} /></button>
                  <span className="px-4 py-2.5 font-semibold text-saree-charcoal min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2.5 hover:bg-gray-50 transition-colors text-gray-600"><Plus size={14} /></button>
                </div>
                <span className={`text-xs font-medium ${product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                  {product.stock === 0 ? '❌ Out of stock' : product.stock <= 5 ? `⚡ Only ${product.stock} left` : `✓ In stock`}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 btn-primary py-3.5 text-base min-w-[180px]"
              >
                {adding ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ShoppingBag size={17} />}
                {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </button>
              <button onClick={() => toggle(product._id)}
                className={`p-3.5 rounded-full border-2 transition-all ${wishlisted ? 'border-saree-rose bg-saree-rose text-white' : 'border-gray-200 text-gray-500 hover:border-saree-rose hover:text-saree-rose'}`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Pincode check */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm font-semibold text-saree-charcoal mb-2 flex items-center gap-1.5">
                <Truck size={14} className="text-saree-rose" /> Check Delivery
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeMsg(''); }}
                  placeholder="Enter pincode"
                  className="input-field py-2 text-sm flex-1"
                />
                <button onClick={checkPincode} className="btn-secondary py-2 px-4 text-sm">Check</button>
              </div>
              {pincodeMsg && <p className="text-green-600 text-xs mt-1.5">{pincodeMsg}</p>}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, text: '100% Authentic', sub: 'Silk Mark certified' },
                { icon: RotateCcw, text: 'Easy Returns', sub: '7-day policy' },
                { icon: Truck, text: 'Fast Delivery', sub: '3–7 business days' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} className="flex flex-col items-center text-center p-3 bg-saree-blush/50 rounded-xl gap-1">
                  <Icon size={16} className="text-saree-rose" />
                  <p className="text-xs font-semibold text-saree-charcoal">{text}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Accordion details */}
            <div className="border-t border-gray-100 pt-2">
              <AccordionSection id="description" title="Description">
                <p>{product.description}</p>
              </AccordionSection>

              <AccordionSection id="details" title="Product Details">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {[
                    ['Fabric', product.fabric],
                    ['Length', `${product.sareeLength}m`],
                    ['Blouse', product.blouseIncluded ? `Included (${product.blouseLength}m)` : 'Not included'],
                    ['Care', product.careInstructions],
                    ['Origin', product.origin],
                    ['Weight', `${product.weight}g`],
                  ].map(([k, v]) => (
                    <React.Fragment key={k}>
                      <span className="font-semibold text-gray-500">{k}</span>
                      <span className="text-gray-700">{v}</span>
                    </React.Fragment>
                  ))}
                </div>
              </AccordionSection>

              <AccordionSection id="shipping" title="Shipping & Returns">
                <ul className="space-y-1.5 list-disc list-inside text-gray-600">
                  <li>Free shipping on orders above ₹999</li>
                  <li>Standard delivery: 5–7 business days</li>
                  <li>Express delivery available at checkout</li>
                  <li>7-day easy return policy</li>
                  <li>Exchange available within 15 days</li>
                </ul>
              </AccordionSection>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews?.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-saree-charcoal mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl p-5 shadow-card">
                  <div className="flex items-start gap-3 mb-3">
                    <img src={review.user?.avatar?.url} alt={review.user?.name} className="w-10 h-10 rounded-full object-cover bg-saree-blush" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-saree-charcoal">{review.user?.name}</p>
                        {review.isVerifiedPurchase && (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><Check size={11} /> Verified</span>
                        )}
                      </div>
                      <div className="flex mt-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400' : 'text-gray-200'} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm text-saree-charcoal mb-1">{review.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {related?.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-saree-charcoal mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
