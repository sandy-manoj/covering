import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall, Sparkles, Languages, ChevronDown, Flame } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../store/useCartStore';
import { useLanguageStore, translations } from '../../store/useLanguageStore';
import { getSettings } from '../../services/api';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  const { lang, toggleLang } = useLanguageStore();
  const t = translations[lang] || translations.en;

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close more dropdown on outside click or Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setSearchOverlayOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOverlayOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const whatsappPhone = settings?.whatsappNumber || '9884893477';

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      
      {/* 1. Top Announcement Marquee */}
      <div className="w-full bg-gradient-to-r from-[#380707] via-[#5c1313] to-[#380707] text-white text-xs py-1.5 px-4 overflow-hidden border-b border-amber-500/20 shadow-xs">
        <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 group cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <span className="font-medium tracking-wide truncate sm:whitespace-normal group-hover:text-amber-200 transition-colors">
            {t.announcement}
          </span>
        </div>
      </div>

      {/* 2. Main Sticky Header (Strictly separated 3 flex zones, zero absolute layout hacks) */}
      <div className={`w-full transition-all duration-300 ${isScrolled ? 'bg-white/98 backdrop-blur-md shadow-md py-2.5' : 'bg-white py-3.5'} border-b border-amber-200/60`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between gap-6">
            
            {/* Zone 1: Logo (flex-shrink: 0, fixed space, NEVER overlaps) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-stone-700 hover:text-amber-600 rounded-lg hover:bg-amber-50 shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-500/25 shrink-0 text-lg transition-transform group-hover:scale-105">
                  👑
                </div>
                <div className="flex flex-col shrink-0">
                  <span className="font-serif text-lg sm:text-xl font-black tracking-tight text-stone-900 leading-none whitespace-nowrap">
                    SINGAPORE <span className="text-amber-600">FANCY</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] tracking-wider text-amber-800 uppercase font-bold mt-1 hidden sm:block whitespace-nowrap">
                    Vandavasi • 1-Gram Micro Gold
                  </span>
                </div>
              </Link>
            </div>

            {/* Zone 2: Navigation Links (Visible on >= 1100px / xl, whitespace-nowrap, gap: 28px) */}
            <nav className="hidden xl:flex items-center gap-7 font-medium text-stone-700 text-sm whitespace-nowrap shrink-0">
              <Link to="/" className="hover:text-amber-600 transition-colors py-1">
                {t.home}
              </Link>
              <Link to="/shop" className="hover:text-amber-600 transition-colors py-1">
                {t.shop}
              </Link>
              <Link to="/rent" className="hover:text-amber-600 transition-colors flex items-center gap-1.5 py-1">
                <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  {t.rentBadge}
                </span>
                <span>{t.bridalRental}</span>
              </Link>
              <Link to="/shop?category=Mugappu+Chains" className="hover:text-amber-600 transition-colors py-1">
                {t.mugappu}
              </Link>
            </nav>

            {/* Zone 3: Actions Right (Separate items, gap: 12px, zero overlap) */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Deepavali Offers Pill Button (Screens >= 1280px) */}
              <Link
                to="/shop?offersOnly=true"
                className="hidden 2xl:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all whitespace-nowrap animate-pulse shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-amber-200" />
                <span>{t.offers}</span>
              </Link>

              {/* Language Pill Switcher ("தமிழ் | EN") */}
              <button
                type="button"
                onClick={toggleLang}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs whitespace-nowrap"
                title="தமிழ் | English"
              >
                <Languages className="w-3.5 h-3.5 text-amber-700" />
                <span>{lang === 'ta' ? 'தமிழ் | EN' : 'EN | தமிழ்'}</span>
              </button>

              {/* Popover "More" Dropdown Menu */}
              <div ref={moreRef} className="relative hidden xl:block shrink-0">
                <button
                  type="button"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex items-center gap-1 text-stone-700 hover:text-amber-600 transition-colors whitespace-nowrap text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"
                  aria-expanded={moreOpen}
                >
                  <span>{lang === 'ta' ? 'மேலும்' : 'More'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-amber-200/80 p-2 z-50 animate-fadeIn">
                    <Link
                      to="/shop?offersOnly=true"
                      onClick={() => setMoreOpen(false)}
                      className="2xl:hidden flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <Flame className="w-4 h-4 text-red-500" />
                      <span>{t.offers}</span>
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl"
                    >
                      {t.about}
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl"
                    >
                      {t.contact}
                    </Link>
                  </div>
                )}
              </div>

              {/* Search Icon */}
              <button
                type="button"
                onClick={() => setSearchOverlayOpen(!searchOverlayOpen)}
                className="p-2 text-stone-700 hover:text-amber-600 rounded-full hover:bg-stone-100 transition-colors shrink-0"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Heart */}
              <Link to="/wishlist" className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors shrink-0" title="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Bag */}
              <Link to="/cart" className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors shrink-0" title="Cart">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* WhatsApp Order Button */}
              <a
                href={`https://wa.me/91${whatsappPhone.replace(/[^0-9]/g, '')}?text=வணக்கம்%20சிங்கப்பூர்%20பேன்சி%20%26%20கவரிங்`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-full shadow-sm transition-all active:scale-95 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{t.whatsappChat}</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Search Overlay Panel */}
      {searchOverlayOpen && (
        <div className="w-full bg-stone-900 border-b border-amber-500/40 py-4 px-4 shadow-2xl animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
            <Search className="w-5 h-5 text-amber-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-stone-800 text-white placeholder-stone-400 text-sm px-4 py-2.5 rounded-full border border-stone-700 focus:outline-hidden focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-full transition-colors shrink-0"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOverlayOpen(false)}
              className="p-2 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-amber-100 bg-white px-5 py-5 space-y-4 font-medium text-stone-700 text-sm shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <span className="text-xs text-stone-500 font-semibold">Language / மொழி:</span>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold"
            >
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>
          </div>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">{t.home}</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">{t.shop}</Link>
          <Link to="/rent" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-amber-800 font-semibold">{t.bridalRental}</Link>
          <Link to="/shop?category=Mugappu+Chains" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">{t.mugappu}</Link>
          <Link to="/shop?offersOnly=true" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-red-600 font-semibold">{t.offers} 🔥</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">{t.about}</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">{t.contact}</Link>
          
          <div className="pt-2">
            <a
              href={`https://wa.me/91${whatsappPhone.replace(/[^0-9]/g, '')}?text=வணக்கம்%20சிங்கப்பூர்%20பேன்சி%20%26%20கவரிங்`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white text-xs font-bold py-3 rounded-full shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t.whatsappChat} (9884893477)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
