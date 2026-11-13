import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { getSettings } from '../../services/api';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t-4 border-amber-600">
      {/* 3 Pillars / Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-center gap-4 bg-stone-800/60 p-4 rounded-xl border border-stone-700/50">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">1-Year Micro Polish Guarantee</h4>
              <p className="text-xs text-stone-400 mt-0.5">Pure 24K gold color retention with micro plating technology</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-800/60 p-4 rounded-xl border border-stone-700/50">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Safe & Fast Express Delivery</h4>
              <p className="text-xs text-stone-400 mt-0.5">Trackable dispatch all across Tamil Nadu and India</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-800/60 p-4 rounded-xl border border-stone-700/50">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Refundable Rental Deposit</h4>
              <p className="text-xs text-stone-400 mt-0.5">Convenient bridal rental return policy with instant UPI refunds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Shop Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-2xl">⚜️</span>
              <span className="font-serif text-xl font-bold text-white tracking-wide">CHIDAMBARAM</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {settings?.tagline || 'Pioneers in traditional 1-Gram gold covering jewellery, bridal rental harams, and handcrafted temple chains with authentic gold sheen.'}
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-3 py-1 rounded-full font-medium">
                Established Chidambaram Craftsmanship
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">Popular Chains</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/shop?category=Mugappu+Chains" className="hover:text-amber-400 transition-colors">Peacock & Floral Mugappu Chains</Link></li>
              <li><Link to="/shop?category=Rope+%26+Box+Chains" className="hover:text-amber-400 transition-colors">Daily Wear Thick Rope Chains</Link></li>
              <li><Link to="/rent" className="hover:text-amber-400 transition-colors">Grand Bridal Rental Harams</Link></li>
              <li><Link to="/shop?category=Traditional+Chains" className="hover:text-amber-400 transition-colors">Kerala Palakka & Temple Chains</Link></li>
              <li><Link to="/shop?category=Customized+Name+Chains" className="hover:text-amber-400 transition-colors">Custom Name Letter Chains</Link></li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Our Gold Covering</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Store Directions & Map</Link></li>
              <li><Link to="/rent" className="hover:text-amber-400 transition-colors">How Bridal Rental Works</Link></li>
              <li><span className="text-stone-400">Jewellery Care & Cleaning Tips</span></li>
              <li><span className="text-stone-400">WhatsApp Ordering Guide</span></li>
            </ul>
          </div>

          {/* Contact Details & Address */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4 font-serif">Visit Our Store</h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  {settings?.address?.street || '144/2, Car Street, Near Natarajar Temple'}<br />
                  {settings?.address?.city || 'Chidambaram'}, {settings?.address?.state || 'Tamil Nadu'} - {settings?.address?.pincode || '608001'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{settings?.contactPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{settings?.contactEmail || 'order@chidambaramcovering.com'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Mon - Sun: 9:30 AM - 9:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-stone-800 pt-6 text-center text-[11px] text-stone-500">
        <p>© {new Date().getFullYear()} {settings?.shopName || 'Chidambaram Sri Thanga Covering'}. All rights reserved.</p>
        <p className="mt-1">Crafted for authentic South Indian gold jewellery lovers.</p>
      </div>
    </footer>
  );
};

export default Footer;

