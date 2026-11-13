import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, ChevronRight, Gift, Percent } from 'lucide-react';
import { getProducts, getBanners, getCategories, getSettings } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Product3DViewerModal from '../components/viewer3d/Product3DViewerModal';
import VirtualTryOnModal from '../components/tryon/VirtualTryOnModal';
import { useLanguageStore, translations } from '../store/useLanguageStore';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredChains, setFeaturedChains] = useState([]);
  const [offerChains, setOfferChains] = useState([]);
  const [allChains, setAllChains] = useState([]);
  const [settings, setSettings] = useState(null);

  const { lang } = useLanguageStore();
  const t = translations[lang] || translations.en;

  const [selectedTryOnProduct, setSelectedTryOnProduct] = useState(null);
  const [selected3DProduct, setSelected3DProduct] = useState(null);

  useEffect(() => {
    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);

    getCategories().then((res) => {
      if (res.data?.data) setCategories(res.data.data);
    }).catch(console.error);

    getProducts({ limit: 20 }).then((res) => {
      const prods = res.data?.data || [];
      setAllChains(prods);
      setFeaturedChains(prods.filter((p) => p.isFeatured).slice(0, 4));
      setOfferChains(prods.filter((p) => p.hasOffer).slice(0, 4));
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full space-y-16 pb-20 overflow-x-clip">
      
      {/* 1. Hero Banner Section (Clean 2-Column Responsive Layout) */}
      <section className="w-full relative bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-950 text-white overflow-hidden py-10 sm:py-16 border-b border-amber-900/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Text & CTAs (No negative offsets, clean left alignment) */}
            <div className="space-y-5 text-center lg:text-left min-w-0">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide uppercase max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{t.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-black tracking-tight text-white leading-tight break-words">
                {t.heroTitle} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                  {t.heroTitleAccent}
                </span>
              </h1>

              <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t.heroDesc}
              </p>

              {/* Festive Offer Card (Relative parent, strictly contained) */}
              <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-stone-900 to-amber-950/90 border border-red-800/40 shadow-xl space-y-2 text-left relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-amber-400 font-serif font-bold text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                    <span className="truncate">
                      {lang === 'ta' ? 'தீபாவளி சிறப்பு சலுகை & பரிசு!' : 'Deepavali Special Discount & Free Gift!'}
                    </span>
                  </div>
                  <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold shrink-0">
                    5% - 20% OFF
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-300 leading-normal">
                  {lang === 'ta' 
                    ? 'ரூ. 500 முதல் ரூ. 5000 வரை வாங்கும் அனைத்து பொருட்களுக்கும் சிறப்பு தள்ளுபடி + Stainless Steel பரிசு இலவசம்!'
                    : 'Get 5% to 20% discount on all purchases from ₹500 to ₹5000 + Free Stainless Steel Gift included!'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/shop"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-6 py-3 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <span>{t.exploreChains}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/rent"
                  className="bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 font-semibold px-5 py-3 rounded-full flex items-center gap-2 transition-all text-xs sm:text-sm"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{t.rentForWeddings}</span>
                </Link>
              </div>

              {/* Trust bullets */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-800 text-[11px] text-stone-400">
                <div className="flex items-center gap-1 justify-center lg:justify-start min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{t.warrantyBullet}</span>
                </div>
                <div className="flex items-center gap-1 justify-center lg:justify-start min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{t.tryOnBullet}</span>
                </div>
                <div className="flex items-center gap-1 justify-center lg:justify-start min-w-0">
                  <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{t.festivalGiftBullet}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Poster Image Card (Strict max-width, fully contained) */}
            <div className="w-full flex justify-center min-w-0">
              <div className="w-full max-w-sm sm:max-w-md relative group">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-500 pointer-events-none" />
                
                <div className="relative bg-stone-900 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-2xl">
                  {/* Shop Info Overlay Header */}
                  <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 px-4 py-2.5 flex items-center justify-between text-white border-b border-amber-600/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-amber-300 shrink-0">👑</span>
                      <span className="font-serif font-black text-xs sm:text-sm tracking-wide truncate">
                        சிங்கப்பூர் பேன்சி & கவரிங்
                      </span>
                    </div>
                    <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                      வந்தவாசி
                    </span>
                  </div>

                  {/* Real Photo 2 Embed */}
                  <div className="relative bg-black aspect-[3/4] overflow-hidden">
                    <img
                      src="/images/shop_banner_singapore.jpg"
                      alt="சிங்கப்பூர் பேன்சி & கவரிங் - வந்தவாசி கடை போஸ்டர்"
                      className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                    {/* Bottom Details Banner */}
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/40 text-xs text-white flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-amber-400 truncate">49-வது பஜார் வீதி, வந்தவாசி</p>
                        <p className="text-[10px] text-stone-300 truncate">I.O.B வங்கிக்கு எதிரில் • 📞 9884893477</p>
                      </div>
                      <Link
                        to="/contact"
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-colors shrink-0"
                      >
                        {lang === 'ta' ? 'வழி & வரைபடம்' : 'Store Map'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.categoriesTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              {lang === 'ta' ? 'எங்களின் தனித்துவமான பிரிவுகள்' : 'Exclusive Jewellery Collections'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">{t.categoriesSubtitle}</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0">
            <span>{t.viewAllChains}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={cat._id || idx}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white p-4 rounded-2xl border border-stone-200/80 hover:border-amber-400 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-amber-50 group-hover:bg-amber-100 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-3 text-2xl transition-transform group-hover:scale-110">
                {idx === 0 ? '✨' : idx === 1 ? '🦚' : idx === 2 ? '⛓️' : idx === 3 ? '👑' : '💎'}
              </div>
              <h3 className="font-serif font-bold text-stone-800 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                {cat.description || 'Micro gold plated collection'}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Deepavali Offer Chains Spotlight */}
      {offerChains.length > 0 && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border border-red-200 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 tracking-wider uppercase">
                    <span>{t.festivalOffersBadge}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
                    {t.festivalOffersTitle}
                  </h2>
                </div>
              </div>
              <Link
                to="/shop?offersOnly=true"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <span>{lang === 'ta' ? 'அனைத்து சலுகைகள்' : 'View All Offers'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
              {offerChains.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onTryOn={(p) => setSelectedTryOnProduct(p)}
                  onView3D={(p) => setSelected3DProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Chains Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.featuredTitle}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
              {lang === 'ta' ? 'அதிகம் விரும்பப்படும் நகைகள்' : 'Most Popular Picks'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">{t.featuredSubtitle}</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 shrink-0">
            <span>{t.viewAllChains}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredChains.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onTryOn={(p) => setSelectedTryOnProduct(p)}
              onView3D={(p) => setSelected3DProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 5. Bridal Rental Service Banner */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-8 sm:p-12 border border-amber-600/40 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold tracking-wider uppercase">
              {t.bridalSpotlightBadge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
              {t.bridalSpotlightTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
              {t.bridalSpotlightDesc}
            </p>
            <div className="pt-2">
              <Link
                to="/rent"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-6 py-3 rounded-full shadow-lg transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.bookRentalBtn}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Try-On Modal */}
      {selectedTryOnProduct && (
        <VirtualTryOnModal
          product={selectedTryOnProduct}
          onClose={() => setSelectedTryOnProduct(null)}
          allProducts={allChains}
          onSelectProduct={(p) => setSelectedTryOnProduct(p)}
        />
      )}

      {/* 3D / 360 Viewer Modal */}
      {selected3DProduct && (
        <Product3DViewerModal
          product={selected3DProduct}
          onClose={() => setSelected3DProduct(null)}
        />
      )}

    </div>
  );
};

export default HomePage;
