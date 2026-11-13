import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { getSettings } from '../services/api';

const ContactPage = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Visit & Connect</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-900">
          Chidambaram Store & Contact
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Located right near the world-renowned Chidambaram Natarajar Temple. Walk in to try on chains or get instant support via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Showroom Address</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {settings?.address?.street || '144/2, Car Street, Near Natarajar Temple'}<br />
              {settings?.address?.city || 'Chidambaram'}, {settings?.address?.state || 'Tamil Nadu'} - {settings?.address?.pincode || '608001'}
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">WhatsApp & Calling</h3>
            <p className="text-xs text-stone-600">
              Call: {settings?.contactPhone || '+91 98765 43210'}<br />
              Email: {settings?.contactEmail || 'order@chidambaramcovering.com'}
            </p>
            {settings?.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Chidambaram%20Covering`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat on WhatsApp
              </a>
            )}
          </div>

          <div className="p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Working Hours</h3>
            <p className="text-xs text-stone-600">
              Monday – Sunday: 9:30 AM – 9:00 PM<br />
              Open on all festival days & Sundays.
            </p>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="lg:col-span-2 h-[420px] rounded-3xl overflow-hidden border border-stone-200 shadow-md">
          <iframe
            title="Shop Location Map"
            src={settings?.mapEmbedUrl || 'https://maps.google.com/maps?q=Chidambaram%20Nataraja%20Temple&t=&z=15&ie=UTF8&iwloc=&output=embed'}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

