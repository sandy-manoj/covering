import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation, Gift, Sparkles } from 'lucide-react';
import { useLanguageStore, translations } from '../store/useLanguageStore';

const ContactPage = () => {
  const { lang } = useLanguageStore();
  const t = translations[lang] || translations.en;

  const phone = '9884893477';
  const whatsappUrl = `https://wa.me/91${phone}?text=வணக்கம்%20சிங்கப்பூர்%20பேன்சி%20%26%20கவரிங்%2C%20எனக்கு%20நகைகள்%20பற்றிய%20விபரம்%20தேவை.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'ta' ? 'கடை முகவரி & நேரடி வருகை' : 'Store Location & Contact'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900">
          {lang === 'ta' ? 'சிங்கப்பூர் பேன்சி & கவரிங்' : 'Singapore Fancy & Covering'}
        </h1>
        <p className="text-stone-600 text-sm">
          {lang === 'ta' 
            ? 'வந்தவாசி பஜார் வீதியில் அமைந்துள்ள எங்கள் கடைக்கு நேரடியாக வந்து நகைகளை பார்வையிட்டு தேர்வு செய்யுங்கள்!'
            : 'Visit our flagship showroom on Bazaar Street, Vandavasi for the finest 1-gram micro gold plated chains & bridal rental jewelry.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Store Details & Contact Cards */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Address Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-md space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {lang === 'ta' ? 'கடை முகவரி' : 'Showroom Address'}
                </h3>
                <p className="text-stone-700 text-sm font-semibold leading-relaxed">
                  49-வது பஜார் வீதி, <br />
                  I.O.B வங்கிக்கு எதிரில், <br />
                  வந்தவாசி - 604 408. <br />
                  திருவண்ணாமலை மாவட்டம், தமிழ்நாடு.
                </p>
                <p className="text-xs text-stone-500 pt-1">
                  (Opposite Indian Overseas Bank, 49th Bazaar Street, Vandavasi)
                </p>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-200 text-stone-900 transition-colors"
              >
                <Phone className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-stone-500 uppercase font-semibold">{lang === 'ta' ? 'தொலைபேசி' : 'Phone'}</p>
                  <p className="font-bold text-sm">{phone}</p>
                </div>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-emerald-700 uppercase font-semibold">{lang === 'ta' ? 'வாட்ஸ்அப்' : 'WhatsApp'}</p>
                  <p className="font-bold text-sm text-emerald-700">{phone}</p>
                </div>
              </a>
            </div>

            {/* Store Hours */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">{lang === 'ta' ? 'வேலை நேரம்:' : 'Store Timings:'}</p>
                <p className="text-amber-800">{lang === 'ta' ? 'திங்கள் முதல் ஞாயிறு வரை: காலை 9:00 - இரவு 9:30' : 'Monday to Sunday: 9:00 AM to 9:30 PM (All 7 Days Open)'}</p>
              </div>
            </div>
          </div>

          {/* Special Festive Offer Banner Card */}
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white p-6 rounded-3xl shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-200 animate-bounce" />
              <h4 className="font-serif font-black text-lg">
                {lang === 'ta' ? 'தீபாவளி சிறப்பு தள்ளுபடி & இலவச பரிசு!' : 'Special Festival Discount & Free Gift!'}
              </h4>
            </div>
            <p className="text-xs text-amber-100 leading-relaxed">
              {lang === 'ta'
                ? 'ரூ. 500 முதல் ரூ. 5000 வரை வாங்கும் அனைத்து பொருட்களுக்கும் 5% முதல் 20% வரை தள்ளுபடி! அத்துடன் Stainless Steel பரிசுப் பொருட்கள் முற்றிலும் இலவசமாக வழங்கப்படும்!'
                : 'Get 5% to 20% flat discount on all purchases from ₹500 to ₹5000! Free Stainless Steel household gifts included!'}
            </p>
          </div>

        </div>

        {/* Right Column: Real Shop Poster Photo Showcase (Photo 2) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200/80 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <span>📍</span>
                <span>{lang === 'ta' ? 'கடை நேரடி போஸ்டர் & அறிவிப்பு' : 'Store Official Poster'}</span>
              </h3>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                வந்தவாசி பஜார்
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-amber-300 shadow-inner bg-stone-900 group">
              <img
                src="/images/shop_banner_singapore.jpg"
                alt="சிங்கப்பூர் பேன்சி & கவரிங் - வந்தவாசி கடை போஸ்டர்"
                className="w-full h-auto object-cover max-h-[500px] mx-auto group-hover:scale-102 transition-transform duration-500"
              />
              <div className="p-4 bg-stone-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-stone-800">
                <div>
                  <p className="font-bold text-amber-400">சிங்கப்பூர் பேன்சி & கவரிங்</p>
                  <p className="text-[11px] text-stone-400">49-வது பஜார் வீதி, I.O.B எதிரில், வந்தவாசி</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Singapore Fancy & Covering, 49 Bazaar Street, Vandavasi, Tamil Nadu')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{lang === 'ta' ? 'Google மேப்பில் பார்க்க' : 'Open in Google Maps'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ContactPage;
