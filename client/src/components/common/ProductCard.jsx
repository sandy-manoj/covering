import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Sparkles, ShoppingBag, Share2, Video, Rotate3D } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../store/useCartStore';
import ProductShareModal from './ProductShareModal';

const ProductCard = ({ product, onTryOn, onView3D }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || product.image || '/images/products/chain_1.jpg',
      productCode: product.productCode,
      orderType: 'Buy',
      quantity: 1,
      unitPrice: product.offerPrice || product.price,
      lineTotal: product.offerPrice || product.price
    });
  };

  const discountPercent = product.hasOffer && product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-white rounded-3xl border border-stone-200/80 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col"
      >
        {/* Image Container with Badges & Slide-up Actions */}
        <div className="relative aspect-square bg-stone-100 overflow-hidden">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images?.[0] || product.image || '/images/products/chain_1.jpg'}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
              loading="lazy"
            />
          </Link>

          {/* Badges on Top */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {discountPercent > 0 && (
              <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md animate-pulse">
                {discountPercent}% OFF
              </span>
            )}
            {product.type === 'Rent' && (
              <span className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md">
                RENTAL
              </span>
            )}
          </div>

          {/* Top-Right Quick Action Buttons (Wishlist + Share) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors shadow-sm ${
                inWishlist
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/80 hover:bg-white text-stone-700'
              }`}
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 backdrop-blur-md transition-colors shadow-sm"
              title="Share Chain to Friends"
            >
              <Share2 className="w-4 h-4 text-stone-600 hover:text-amber-600" />
            </button>
          </div>

          {/* Slide-up Buttons: Try On & 360° — desktop hover only, never triggered by tapping the product card itself */}
          <div className="absolute inset-x-2 bottom-2 items-center gap-1.5 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10 hidden sm:flex">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTryOn && onTryOn(product); }}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[11px] py-1.5 rounded-xl shadow-md flex items-center justify-center gap-1 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Try On</span>
            </button>

            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onView3D && onView3D(product); }}
              className="flex-1 bg-stone-900/90 hover:bg-stone-900 text-white font-bold text-[11px] py-1.5 rounded-xl shadow-md flex items-center justify-center gap-1 transition-colors"
            >
              <Rotate3D className="w-3.5 h-3.5 text-amber-400" />
              <span>360°</span>
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[10px] text-amber-700 uppercase font-semibold tracking-wider">
              {product.category || 'Gold Plated Chain'}
            </div>
            <Link to={`/product/${product._id}`}>
              <h3 className="font-serif font-bold text-stone-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1 mt-0.5">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="pt-2 flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-sm text-stone-950">
                ₹{product.offerPrice || product.price}
              </span>
              {product.hasOffer && product.offerPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ProductShareModal
        product={product}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
};

export default ProductCard;
