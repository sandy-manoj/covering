import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, X } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Product3DViewerModal from '../components/viewer3d/Product3DViewerModal';
import VirtualTryOnModal from '../components/tryon/VirtualTryOnModal';

const ShopPage = ({ initialType = 'All' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [type, setType] = useState(initialType || searchParams.get('type') || 'All'); // 'All', 'Buy', 'Rent'
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [style, setStyle] = useState(searchParams.get('style') || '');
  const [offersOnly, setOffersOnly] = useState(searchParams.get('offersOnly') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modals
  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState(null);
  const [selected3DProduct, setSelected3DProduct] = useState(null);

  const chainStyles = ['All', 'Rope', 'Box', 'Mugappu', 'Traditional', 'Figaro', 'Curb', 'Spiga Wheat', 'Singapore'];

  useEffect(() => {
    getCategories().then((res) => {
      if (res.data?.data) setCategories(res.data.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {
      type: type !== 'All' ? type : undefined,
      category: category || undefined,
      style: style && style !== 'All' ? style : undefined,
      offersOnly: offersOnly ? true : undefined,
      search: searchParams.get('search') || undefined,
      sort
    };

    getProducts(params).then((res) => {
      setProducts(res.data?.data || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [type, category, style, offersOnly, sort, searchParams]);

  const clearAllFilters = () => {
    setType('All');
    setCategory('');
    setStyle('');
    setOffersOnly(false);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-6 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
            {type === 'Rent' ? 'Special Occasion Jewellery' : 'Chidambaram Collection'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold mt-1">
            {type === 'Rent' ? 'Bridal Rental Chains' : 'Authentic Gold Covering Chains'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {type === 'Rent' 
              ? 'Save high expenses with rental chains for wedding receptions, temple events and baby showers with 100% deposit return.'
              : 'Explore rope chains, mugappu side motifs, and box chains with guaranteed 1-year micro gold polish and interactive camera try-on.'}
          </p>
        </div>
      </div>

      {/* Main Grid & Filters Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-600" /> Filters
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-amber-700 hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Mode: Buy vs Rent */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">Purchase Type</h4>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
              {['All', 'Buy', 'Rent'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-1.5 rounded-lg transition-all ${
                    type === t ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-stone-600 hover:text-black'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Offers Only Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={offersOnly}
                onChange={(e) => setOffersOnly(e.target.checked)}
                className="w-4 h-4 rounded-sm text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
              <span className="text-xs font-semibold text-stone-800">
                Discount Offers Only (% OFF)
              </span>
            </label>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">Category</h4>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${
                  category === '' ? 'bg-amber-50 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat.name)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-colors ${
                    category === cat.name ? 'bg-amber-50 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chain Styles */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">Chain Style</h4>
            <div className="flex flex-wrap gap-1.5">
              {chainStyles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s === 'All' ? '' : s)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                    (style === s || (s === 'All' && !style))
                      ? 'border-amber-600 bg-amber-600 text-white font-semibold'
                      : 'border-stone-200 text-stone-600 hover:border-amber-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid & Sorting Controls */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Top Sort Bar & Mobile Filter Trigger */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <span className="text-xs text-stone-500 font-medium">
              Showing <strong className="text-stone-900">{products.length}</strong> Chains
            </span>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg text-stone-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-800 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Biggest Discount %</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-stone-100 animate-pulse rounded-2xl aspect-4/5" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onTryOn={(p) => setSelectedTryOnProduct(p)}
                  onShow3D={(p) => setSelected3DProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-4">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-900">No chains found matching filters</h3>
              <p className="text-xs text-stone-500">Try adjusting your filters or search keywords.</p>
              <button
                onClick={clearAllFilters}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-full"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Virtual Try-On Modal */}
      <VirtualTryOnModal
        isOpen={Boolean(selectedTryOnProduct)}
        product={selectedTryOnProduct}
        allProducts={products}
        onClose={() => setSelectedTryOnProduct(null)}
        onSelectProduct={(p) => setSelectedTryOnProduct(p)}
      />

      {/* 3D / 360 Viewer Modal */}
      <Product3DViewerModal
        isOpen={Boolean(selected3DProduct)}
        product={selected3DProduct}
        onClose={() => setSelected3DProduct(null)}
      />
    </div>
  );
};

export default ShopPage;

