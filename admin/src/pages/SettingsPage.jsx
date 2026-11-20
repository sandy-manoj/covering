import React, { useState, useEffect } from 'react';
import { Save, Phone, MapPin, Sparkles, Check } from 'lucide-react';
import { getAdminSettings, updateAdminSettings } from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    shopName: 'Chidambaram Sri Thanga Covering',
    tagline: '1 Gram Pure Micro Gold Plated Chains & Bridal Rental Jewellery',
    whatsappNumber: '919876543210',
    contactPhone: '+91 98765 43210',
    contactEmail: 'order@chidambaramcovering.com',
    shippingNotice: '✨ Special Festival Offer: Flat 20% OFF on Traditional Chains | Free Shipping above ₹999',
    rentalTerms: 'Rental requires 100% refundable security deposit returned within 24 hours of undamaged chain return.',
    address: {
      street: '144/2, Car Street, Near Natarajar Temple',
      city: 'Chidambaram',
      state: 'Tamil Nadu',
      pincode: '608001'
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then((res) => {
        if (res.data?.data) setSettings(res.data.data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAdminSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Store Settings & WhatsApp Integration</h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure the owner's WhatsApp receiving number, shop address, and announcements
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <Check className="w-4 h-4" />
          Settings updated successfully! Changes are immediately live on the customer site.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 text-xs">
        
        {/* WhatsApp & Phone Config */}
        <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-4">
          <h3 className="font-serif font-bold text-sm text-amber-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600" />
            WhatsApp Order Dispatch Number (Crucial)
          </h3>
          <p className="text-[11px] text-stone-600">
            All customer checkout requests automatically create WhatsApp chats targeting this specific phone number. Do not include "+" or dashes (e.g. <strong>919876543210</strong> for India).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-800 block mb-1">Owner WhatsApp Phone (Digits Only) *</label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-800 block mb-1">Customer Care Display Number</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Brand Details */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900">Brand Identity & Notices</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Store Name</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Top Announcement Banner Bar</label>
            <input
              type="text"
              value={settings.shippingNotice}
              onChange={(e) => setSettings({ ...settings, shippingNotice: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>
        </div>

        {/* Physical Address */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            Store Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">Street Address</label>
              <input
                type="text"
                value={settings.address?.street || ''}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, street: e.target.value } })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Pincode</label>
              <input
                type="text"
                value={settings.address?.pincode || ''}
                onChange={(e) => setSettings({ ...settings, address: { ...settings.address, pincode: e.target.value } })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

