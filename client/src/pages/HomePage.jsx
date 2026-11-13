import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Award, Flame, Calendar, ChevronRight } from 'lucide-react';
import { getProducts, getBanners, getCategories } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Product3DViewerModal from '../components/viewer3d/Product3DViewerModal';
import VirtualTryOnModal from '../components/tryon/VirtualTryOnModal';

const HomePage = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredChains, setFeaturedChains] = useState([]);
  const [offerChains, setOfferChains] = useState([]);
  const [rentalChains, setRentalChains] = useState([]);
  const [allChains, setAllChains] = useState([]);

  // Modals state
  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState(null);
  const [selected3DProduct, setSelected3DProduct] = useState(null);

  useEffect(() => {
    // Fetch banners
    getBanners().then((res) => {
      if (res.data?.data) setBanners(res.data.data);
    }).catch(console.error);

    // Fetch categories
    getCategories().then((res) => {
      if (res.data?.data) setCategories(res.data.data);
    }).catch(console.error);

    // Fetch products
    getProducts({ limit: 20 }).then((res) => {
      const prods = res.data?.data || [];
      setAllChains(prods);
      setFeaturedChains(prods.filter((p) => p.isFeatured).slice(0, 4));
      setOfferChains(prods.filter((p) => p.hasOffer).slice(0, 4));
      setRentalChains(prods.filter((p) => p.type === 'Rent' || p.type === 'Both').slice(0, 4));
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-950 to-amber-950 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text & CTAs */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Chidambaram Famous 1-Gram Gold Covering
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-white leading-tight">
                Pure Gold Sheen, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
                  Guaranteed Craftsmanship.
                </span>
              </h1>

              <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Discover authentic South Indian micro gold-plated rope, box, and bridal haram chains. Designed to match genuine 24K gold with 1-year polish guarantee, now with camera-based Virtual Try-on.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/shop"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-7 py-3 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <span>Explore Chains</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/rent"
                  className="bg-stone-800/80 hover:bg-stone-800 text-amber-300 border border-amber-600/50 font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Rent for Weddings</span>
                </Link>
              </div>

              {/* Trust bullets */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-800 text-xs text-stone-400">
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>1-Yr Polish Warranty</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Interactive 3D & Try-On</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Handcrafted Quality</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card / 3D Promo */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40 bg-stone-900 group">
                <img
                  src="/images/products/chain_1.jpg"
                  alt="Chidambaram Gold Covering Chain"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating pill badge */}
                <div className="absolute bottom-6 inset-x-6 bg-stone-950/85 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">MUGAPPU COLLECTION</span>
                    <h4 className="font-serif text-white font-bold text-sm">Peacock Double Mugappu Chain</h4>
                    <p className="text-amber-400 text-xs font-semibold mt-0.5">₹1,699 <span className="line-through text-stone-500 text-[11px]">₹2,200</span></p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedTryOnProduct(allChains[0] || { name: 'Thick Rope Chain', images: ['/images/products/chain_1.jpg'] })}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Try on
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Handcrafted Styles</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">Shop by Category</h2>
          </div>
          <Link to="/shop" className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat._id || i}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-2xl p-4 border border-stone-200/80 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 bg-stone-100 border border-stone-200 group-hover:scale-105 transition-transform">
                <img
                  src={`/images/products/chain_${(i % 15) + 1}.jpg`}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Festival Offer Deals */}
      {offerChains.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-600 text-white">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Festival Special Offers</h2>
                  <p className="text-xs text-stone-600">Up to 35% OFF on select traditional 1-gram gold covering chains</p>
                </div>
              </div>
              <Link to="/shop?offersOnly=true" className="hidden sm:flex text-xs font-bold text-amber-800 hover:underline items-center gap-1">
                See All Offers <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {offerChains.map((chain) => (
                <ProductCard
                  key={chain._id}
                  product={chain}
                  onTryOn={(p) => setSelectedTryOnProduct(p)}
                  onShow3D={(p) => setSelected3DProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Chains Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Customer Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">Featured Chains & Pendants</h2>
          </div>
          <Link to="/shop" className="text-xs sm:text-sm font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1">
            View All Chains <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredChains.map((chain) => (
            <ProductCard
              key={chain._id}
              product={chain}
              onTryOn={(p) => setSelectedTryOnProduct(p)}
              onShow3D={(p) => setSelected3DProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Bridal Jewellery Rental Spotlight */}
      <section className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12">
            <div className="lg:col-span-1 space-y-4">
              <span className="bg-purple-900/60 text-purple-300 border border-purple-700/60 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Bridal Rental Service
              </span>
              <h2 className="text-3xl font-serif font-bold leading-tight">
                Grand Bridal Sets <br />
                <span className="text-amber-400">Available For Rent</span>
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Save lakhs on wedding jewelry. Rent royal Kasu Mala, Temple Haram and antique chains for your special days at affordable daily & weekly charges. 100% refundable security deposit.
              </p>
              <Link
                to="/rent"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-full text-xs shadow-lg transition-transform active:scale-95"
              >
                <span>View Rental Chains</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {rentalChains.slice(0, 2).map((chain) => (
                <ProductCard
                  key={chain._id}
                  product={chain}
                  onTryOn={(p) => setSelectedTryOnProduct(p)}
                  onShow3D={(p) => setSelected3DProduct(p)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modals for 3D and Try-On */}
      <VirtualTryOnModal
        isOpen={Boolean(selectedTryOnProduct)}
        product={selectedTryOnProduct}
        allProducts={allChains}
        onClose={() => setSelectedTryOnProduct(null)}
        onSelectProduct={(p) => setSelectedTryOnProduct(p)}
      />

      <Product3DViewerModal
        isOpen={Boolean(selected3DProduct)}
        product={selected3DProduct}
        onClose={() => setSelected3DProduct(null)}
      />
    </div>
  );
};

export default HomePage;

