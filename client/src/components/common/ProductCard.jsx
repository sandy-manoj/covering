import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Eye } from 'lucide-react';
import { useWishlistStore } from '../../store/useCartStore';
import { formatCurrency } from '../../utils/whatsapp';

const ProductCard = ({ product, onTryOn, onShow3D }) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product._id);

  const displayPrice = product.hasOffer && product.offerPrice > 0 ? product.offerPrice : product.price;
  const isRentalOnly = product.type === 'Rent';

  return (
    <div className="group bg-white rounded-2xl border border-stone-100 shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.hasOffer && product.discountPercentage > 0 && (
          <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
            {product.discountPercentage}% OFF
          </span>
        )}
        {product.type === 'Rent' && (
          <span className="bg-purple-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            RENTAL ONLY
          </span>
        )}
        {product.type === 'Both' && (
          <span className="bg-amber-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
            BUY / RENT
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
            BEST SELLER
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-stone-500 hover:text-rose-500 hover:bg-white shadow-xs transition-all"
        title="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image Area */}
      <Link to={`/product/${product._id}`} className="block relative aspect-square bg-stone-50 overflow-hidden">
        <img
          src={product.images?.[0] || '/images/products/chain_1.jpg'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick Action Overlay (Try On & 360 preview) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          {onTryOn && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTryOn(product);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 transition-transform active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              Try On
            </button>
          )}

          {onShow3D && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShow3D(product);
              }}
              className="bg-stone-900/90 hover:bg-black text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 transition-transform active:scale-95"
            >
              <Eye className="w-3 h-3" />
              360° View
            </button>
          )}
        </div>
      </Link>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Style Spec */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span>{product.categoryName || 'Chains'}</span>
            <span className="font-medium text-amber-800">{product.specs?.style || 'Chain'}</span>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product._id}`}>
            <h3 className="font-serif font-semibold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Specs Snippet */}
          <p className="text-[11px] text-stone-500 mt-1">
            {product.specs?.length || '22 in'} • {product.specs?.weight || '25g'}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-baseline justify-between">
          {!isRentalOnly ? (
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base text-stone-900">
                {formatCurrency(displayPrice)}
              </span>
              {product.hasOffer && product.offerPrice > 0 && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          ) : (
            <div>
              <span className="text-xs text-stone-500">Rent from: </span>
              <span className="font-bold text-base text-purple-700">
                ₹{product.rental?.pricePerDay || 200}/day
              </span>
            </div>
          )}

          {/* Type Badge or rental hint */}
          {product.type === 'Both' && product.rental?.pricePerDay > 0 && (
            <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
              Rent: ₹{product.rental.pricePerDay}/d
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

