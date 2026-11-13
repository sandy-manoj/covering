import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall, Sparkles, Languages, ChevronDown } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../store/useCartStore';
import { useLanguageStore, translations } from '../../store/useLanguageStore';
import { getSettings } from '../../services/api';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [settings, setSettings] = useState(null);
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
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const whatsappPhone = settings?.whatsappNumber || '9884893477';

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-amber-200/80 shadow-xs">
      
      {/* 1. Announcement Bar (100% width wrapper with marquee/wrap on mobile) */}
      <div className="w-full bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 text-white text-xs py-1.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
          <span className="font-medium tracking-wide truncate sm:whitespace-normal">
            {t.announcement}
          </span>
        </div>
      </div>

      {/* 2. Main Navbar Bar */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-3">
            
            {/* Left: Mobile Drawer Trigger + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-stone-700 hover:text-amber-600 rounded-lg hover:bg-amber-50 shrink-0"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/" className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0 font-serif font-black text-lg">
                  👑
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-serif text-base sm:text-xl xl:text-2xl font-black tracking-tight text-stone-900 leading-tight truncate">
                    {lang === 'ta' ? 'சிங்கப்பூர்' : 'SINGAPORE'} <span className="text-amber-600">{lang === 'ta' ? 'பேன்சி & கவரிங்' : 'FANCY & COVERING'}</span>
                  </span>
                  <span className="text-[10px] sm:text-xs tracking-wider text-amber-800 uppercase font-semibold truncate">
                    {lang === 'ta' ? 'வந்தவாசி • 1-கிராம் மைக்ரோ கோல்டு கவரிங்' : 'Vandavasi • 1-Gram Micro Gold Plated'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Centre: Desktop Navigation Links (Responsive with "More" dropdown) */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6 font-medium text-stone-700 text-xs xl:text-sm shrink min-w-0">
              <Link to="/" className="hover:text-amber-600 transition-colors whitespace-nowrap">{t.home}</Link>
              <Link to="/shop" className="hover:text-amber-600 transition-colors whitespace-nowrap">{t.shop}</Link>
              <Link to="/rent" className="hover:text-amber-600 transition-colors flex items-center gap-1 whitespace-nowrap">
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1 py-0.5 rounded-full font-bold uppercase">{t.rentBadge}</span>
                <span>{t.bridalRental}</span>
              </Link>
              <Link to="/shop?category=Mugappu+Chains" className="hover:text-amber-600 transition-colors whitespace-nowrap">{t.mugappu}</Link>
              <Link to="/shop?offersOnly=true" className="hover:text-amber-600 transition-colors text-red-600 font-semibold whitespace-nowrap flex items-center gap-1">
                <span>{t.offers}</span>
                <span>🔥</span>
              </Link>

              {/* More Dropdown for About & Contact to prevent header overflow */}
              <div className="relative">
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                  className="flex items-center gap-1 hover:text-amber-600 transition-colors whitespace-nowrap text-stone-700 py-1"
                >
                  <span>{lang === 'ta' ? 'மேலும்' : 'More'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {moreDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-fadeIn">
                    <Link to="/about" className="block px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-700">
                      {t.about}
                    </Link>
                    <Link to="/contact" className="block px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-700">
                      {t.contact}
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Actions (Language Switch, Expandable Search, Wishlist, Cart, WhatsApp) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Language Switcher Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
                title="Change Language / மொழியை மாற்றுக"
              >
                <Languages className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.switchLang}</span>
              </button>

              {/* Expandable Search Button / Field */}
              <div className="relative flex items-center">
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="flex items-center bg-stone-100 rounded-full pl-3 pr-1 py-1 border border-amber-400">
                    <input
                      type="text"
                      autoFocus
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-32 sm:w-48 text-xs bg-transparent focus:outline-hidden text-stone-800"
                    />
                    <button type="button" onClick={() => setSearchOpen(false)} className="p-1 text-stone-400 hover:text-stone-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2 text-stone-700 hover:text-amber-600 rounded-full hover:bg-stone-100 transition-colors"
                    title="Search"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link to="/wishlist" className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors" title="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link to="/cart" className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors" title="Cart">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop WhatsApp Quick Order Button */}
              <a
                href={`https://wa.me/91${whatsappPhone.replace(/[^0-9]/g, '')}?text=வணக்கம்%20சிங்கப்பூர்%20பேன்சி%20%26%20கவரிங்`}
                target="_blank"
                rel="noreferrer"
                className="hidden xl:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-xs transition-all active:scale-95 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{t.whatsappChat}</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-100 bg-stone-50 px-4 py-4 space-y-3 font-medium text-stone-700 text-sm animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="text-xs text-stone-500 font-semibold">Language / மொழி:</span>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold"
            >
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.switchLang}</span>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full pt-1 pb-2">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-full focus:outline-hidden focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
          </form>

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
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-full"
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
