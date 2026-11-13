import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Calendar, ChevronRight, Gift, Percent, Clock } from 'lucide-react';
import { getProducts, getCategories, getSettings } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import Product3DViewerModal from '../components/viewer3d/Product3DViewerModal';
import VirtualTryOnModal from '../components/tryon/VirtualTryOnModal';
import Hero3DChain from '../components/common/Hero3DChain';
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

  // Live Deepavali countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 45, seconds: 30 });

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

    // Live countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full space-y-16 pb-20 overflow-x-clip bg-[#FAF9F6]">
      
      {/* 1. Hero Section (No 100vh height bug, clean padding: 64px 24px, 2-column grid) */}
      <section className="w-full relative bg-gradient-to-br from-[#2b0808] via-[#1a0808] to-[#110505] text-white overflow-hidden py-14 lg:py-16 border-b border-amber-900/40">
        
        {/* Soft Diya Sparkle Backdrop */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#d4af37_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />

        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Festival Offer Card, CTAs, 3 Trust Badges */}
            <div className="space-y-5 text-center lg:text-left min-w-0">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide uppercase max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{t.heroBadge}</span>
              </div>

              {/* Shimmering Gold Typography */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-serif font-black tracking-tight text-white leading-tight break-words">
                {t.heroTitle} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffb300] gold-shimmer">
                  {t.heroTitleAccent}
                </span>
              </h1>

              <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t.heroDesc}
              </p>

              {/* Festival Offer Box with Live Deepavali Countdown */}
              <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#310c0c] to-amber-950/90 border border-red-700/50 shadow-2xl space-y-3 text-left relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 text-amber-300 font-serif font-bold text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Gift className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                    <span className="truncate">
                      {lang === 'ta' ? 'தீபாவளி சிறப்பு தள்ளுபடி + Stainless Steel பரிசு இலவசம்!' : 'Deepavali Special Discount + Free Stainless Steel Gift!'}
                    </span>
                  </div>
                  <span className="bg-red-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-sans font-black shrink-0">
                    5% - 20% OFF
                  </span>
                </div>

                {/* Countdown Timer Row */}
                <div className="flex items-center gap-2 pt-1 border-t border-red-800/40 text-amber-200 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold">{lang === 'ta' ? 'சலுகை முடியும் நேரம்:' : 'Offer Ends In:'}</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-white text-xs">
                    <span className="bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">{timeLeft.days}d</span>:
                    <span className="bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">{timeLeft.hours}h</span>:
                    <span className="bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">{timeLeft.minutes}m</span>:
                    <span className="bg-black/60 px-2 py-0.5 rounded border border-amber-500/30 text-amber-400">{timeLeft.seconds}s</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (CTAs visible without scrolling) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/shop"
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black px-7 py-3 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <span>{t.exploreChains}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/rent"
                  className="bg-stone-900/90 hover:bg-stone-800 text-amber-300 border border-amber-500/40 font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-all text-xs sm:text-sm"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>{t.rentForWeddings}</span>
                </Link>
              </div>

              {/* 3 Trust Badges Evenly Spaced in a Row */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-stone-800/80 text-xs text-stone-400">
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t.warrantyBullet}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t.tryOnBullet}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{t.festivalGiftBullet}</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Gold Chain Card (Vertically Centered with Radial Gold Glow) */}
            <div className="relative flex flex-col items-center justify-center min-w-0">
              
              {/* Radial Gold Glow Behind Card */}
              <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,#d4af37_0%,transparent_70%)] opacity-25 blur-2xl pointer-events-none" />

              <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-stone-900 via-stone-950 to-black rounded-3xl border-2 border-amber-500/60 shadow-2xl overflow-hidden relative">
                
                {/* 3D Header Bar */}
                <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 px-4 py-2.5 flex items-center justify-between text-white text-xs border-b border-amber-600/40">
                  <div className="flex items-center gap-1.5 font-serif font-bold">
                    <span>👑</span>
                    <span>3D Interactive Gold Chain</span>
                  </div>
                  <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <span>👆</span>
                    <span>TOUCH & SPIN</span>
                  </span>
                </div>

                {/* Real-time 3D Canvas */}
                <Suspense fallback={<div className="h-80 flex items-center justify-center text-amber-400 text-xs">Loading 3D Gold...</div>}>
                  <Hero3DChain style="curb" />
                </Suspense>
              </div>

              {/* Vandavasi Shop Thumbnail Placed Below Card (Not covering the chain) */}
              <div className="mt-3.5 flex items-center gap-2.5 p-2 bg-stone-900/90 border border-amber-500/40 rounded-2xl shadow-md max-w-xs w-full">
                <img
                  src="/images/shop_banner_singapore.jpg"
                  alt="சிங்கப்பூர் பேன்சி & கவரிங்"
                  className="w-10 h-10 object-cover rounded-xl border border-amber-400/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-amber-300 truncate">சிங்கப்பூர் பேன்சி & கவரிங்</p>
                  <p className="text-[10px] text-stone-400 truncate">49-வது பஜார் வீதி, வந்தவாசி (I.O.B எதிரில்)</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. Category Strip */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
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
              className="group bg-white p-5 rounded-3xl border border-stone-200/80 hover:border-amber-400 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
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
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* 4. Featured Premium Chains with Share Feature */}
      <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* 5. Modals */}
      {selectedTryOnProduct && (
        <VirtualTryOnModal
          product={selectedTryOnProduct}
          onClose={() => setSelectedTryOnProduct(null)}
          allProducts={allChains}
          onSelectProduct={(p) => setSelectedTryOnProduct(p)}
        />
      )}

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
