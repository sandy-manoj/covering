import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, RefreshCw, Gift } from 'lucide-react';
import { getSettings } from '../../services/api';
import { useLanguageStore, translations } from '../../store/useLanguageStore';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const { lang } = useLanguageStore();
  const t = translations[lang] || translations.en;

  useEffect(() => {
    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);
  }, []);

  const phone = settings?.contactPhone || '9884893477';
  const address = settings?.address?.street || '49-வது பஜார் வீதி, I.O.B வங்கிக்கு எதிரில், வந்தவாசி';

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t-4 border-amber-600">
      {/* 3 Pillars / Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">{t.pillar1Title}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.pillar1Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">{t.pillar2Title}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.pillar2Desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">{t.pillar3Title}</h4>
              <p className="text-xs text-stone-400 mt-0.5">{t.pillar3Desc}</p>
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
              <span className="text-amber-500 text-2xl">👑</span>
              <span className="font-serif text-lg font-black text-white tracking-wide">
                {lang === 'ta' ? 'சிங்கப்பூர் பேன்சி & கவரிங்' : 'SINGAPORE FANCY & COVERING'}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {lang === 'ta' 
                ? 'வந்தவாசி மற்றும் சுற்றுவட்டாரப் பகுதிகளில் 1-கிராம் மைக்ரோ தங்க முலாம் செயின்கள், முகூர்த்த நகைகள் வாடகை மற்றும் சிறந்த தரமான கவரிங் ஆபரணங்கள் கிடைக்கும் நம்பகமான கடை.'
                : 'Pioneers in traditional 1-Gram gold covering jewellery, bridal rental harams, and handcrafted temple chains in Vandavasi.'}
            </p>
            <div className="pt-1">
              <span className="inline-block text-[11px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-3 py-1 rounded-full font-medium">
                {lang === 'ta' ? 'வந்தவாசியின் நம்பகமான கடை' : 'Trusted Store in Vandavasi'}
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-serif">
              {lang === 'ta' ? 'பிரபலமான செயின்கள்' : 'Popular Collections'}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/shop?category=Mugappu+Chains" className="hover:text-amber-400 transition-colors">{lang === 'ta' ? 'மயில் & மாங்காய் முகப்பு செயின்கள்' : 'Peacock & Floral Mugappu Chains'}</Link></li>
              <li><Link to="/shop?category=Rope+%26+Box+Chains" className="hover:text-amber-400 transition-colors">{lang === 'ta' ? 'ரோப் மற்றும் பாக்ஸ் தினசரி செயின்கள்' : 'Daily Wear Rope & Box Chains'}</Link></li>
              <li><Link to="/rent" className="hover:text-amber-400 transition-colors text-amber-300 font-semibold">{lang === 'ta' ? 'பிரம்மாண்ட திருமண வாடகை ஆரங்கள்' : 'Grand Bridal Rental Harams'}</Link></li>
              <li><Link to="/shop?category=Traditional+Chains" className="hover:text-amber-400 transition-colors">{lang === 'ta' ? 'பாரம்பரிய கோவில் ஆபரணங்கள்' : 'Traditional Temple Chains'}</Link></li>
              <li><Link to="/shop?category=Customized+Name+Chains" className="hover:text-amber-400 transition-colors">{lang === 'ta' ? 'பெயர் பொறித்த தங்க செயின்கள்' : 'Custom Name Letter Chains'}</Link></li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-serif">
              {lang === 'ta' ? 'வாடிக்கையாளர் சேவை' : 'Customer Care'}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">{t.about}</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">{t.contact}</Link></li>
              <li><Link to="/rent" className="hover:text-amber-400 transition-colors">{lang === 'ta' ? 'வாடகை எடுக்கும் முறை' : 'How Bridal Rental Works'}</Link></li>
              <li><span className="text-stone-400">{lang === 'ta' ? 'பாலிஷ் பராமரிப்பு முறைகள்' : 'Jewellery Care Tips'}</span></li>
              <li><span className="text-stone-400">{lang === 'ta' ? 'வாட்ஸ்அப் ஆர்டர் வழிகாட்டி' : 'WhatsApp Order Guide'}</span></li>
            </ul>
          </div>

          {/* Contact Details & Address (From Photo 2) */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4 font-serif">{t.visitStore}</h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>49-வது பஜார் வீதி</strong><br />
                  I.O.B வங்கிக்கு எதிரில்,<br />
                  வந்தவாசி - 604 408.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <a href={`tel:${phone}`} className="hover:text-amber-400 font-semibold text-white">
                    {phone}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t.monSun}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-stone-800/80 pt-6 text-center text-[11px] text-stone-500">
        <p>© {new Date().getFullYear()} சிங்கப்பூர் பேன்சி & கவரிங் (Singapore Fancy & Covering, Vandavasi). {t.allRightsReserved}</p>
        <p className="mt-1">அசல் 24K தங்க நிறம் கொண்ட 1-கிராம் மைக்ரோ கவரிங் நகைகள் மற்றும் திருமண வாடகை சேவைகள்.</p>
      </div>
    </footer>
  );
};

export default Footer;
