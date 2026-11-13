import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, PhoneCall, Sparkles } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../store/useCartStore';
import { getSettings } from '../../services/api';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);
  const navigate = useNavigate();

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
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
        <span>{settings?.shippingNotice || '1 Gram Guaranteed Micro Gold Plated Chains | Express All-India Shipping'}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-amber-600 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo & Brand Name */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-block">
              <div className="flex flex-col items-center lg:items-start">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-900 flex items-center gap-1.5">
                  <span className="text-amber-500">⚜️</span>
                  <span>CHIDAMBARAM</span>
                </span>
                <span className="text-[10px] sm:text-xs tracking-widest text-amber-700 uppercase font-semibold">
                  Gold Covering & Bridal Chains
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-stone-700 text-sm">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-amber-600 transition-colors">Shop All Chains</Link>
            <Link to="/rent" className="hover:text-amber-600 transition-colors flex items-center gap-1">
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">RENT</span>
              Bridal Rental
            </Link>
            <Link to="/shop?category=Mugappu+Chains" className="hover:text-amber-600 transition-colors">Mugappu</Link>
            <Link to="/shop?offersOnly=true" className="hover:text-amber-600 transition-colors text-red-600 font-semibold">
              Festival Offers 🔥
            </Link>
            <Link to="/about" className="hover:text-amber-600 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-amber-600 transition-colors">Contact</Link>
          </nav>

          {/* Action Icons & Search */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Search Box Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                placeholder="Search chains, mugappu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-full focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors" title="Wishlist">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-stone-700 hover:text-amber-600 transition-colors" title="Cart">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* WhatsApp Quick Chat */}
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Chidambaram%20Gold%20Covering%2C%20I%20have%20an%20enquiry.`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-xs transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden py-2 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search rope, box, mugappu chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-full focus:outline-hidden focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-100 bg-stone-50 px-4 py-4 space-y-3 font-medium text-stone-700 text-sm animate-fadeIn">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">Home</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">Shop All Chains</Link>
          <Link to="/rent" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-amber-800 font-semibold">Bridal Rental Chains (Wedding Special)</Link>
          <Link to="/shop?category=Mugappu+Chains" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">Mugappu Chains</Link>
          <Link to="/shop?category=Traditional+Chains" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">Traditional Temple Chains</Link>
          <Link to="/shop?offersOnly=true" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-red-600 font-semibold">Festival Offers 🔥</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">About Us</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-amber-600">Contact & Shop Location</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;

