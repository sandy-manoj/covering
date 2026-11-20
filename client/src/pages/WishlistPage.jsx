import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../store/useCartStore';
import ProductCard from '../components/common/ProductCard';

const WishlistPage = () => {
  const { items } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-stone-500">Tap the heart icon on any chain to save it here for later.</p>
        <Link
          to="/shop"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-6 py-2.5 rounded-full"
        >
          Explore Chains
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900">Saved Chains</h1>
        <p className="text-xs text-stone-500 mt-1">{items.length} item(s) in your personal collection</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;

