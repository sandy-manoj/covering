import React from 'react';
import { ShieldCheck, Award, Sparkles, HeartHandshake } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Intro */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Heritage Craft</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
          The Legacy of Authentic <br />
          <span className="text-amber-700">Chidambaram Gold Covering</span>
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          For generations, the ancient temple town of Chidambaram in Tamil Nadu has been internationally revered for mastering the delicate art of micro gold-plated jewellery that mirrors genuine hallmarked gold down to every link and grain.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">What is 1-Gram Gold Covering?</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Unlike cheap imitation jewelry that tarnishes within weeks, Chidambaram gold covering uses an advanced multi-stage copper-brass alloy substrate coated with pure 24K gold micro-layering. It possesses the authentic warm glow and dense hand-feel of solid gold.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">1-Year Micro Polish Guarantee</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Every chain we manufacture is baked with a double anti-tarnish protective lacquer coat. We provide a full 1-year polish guarantee against normal daily wear, sweat, and moisture.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">Affordable Bridal Rentals</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            With gold prices reaching historical highs, our rental service allows brides and families to wear majestic 90-gram Lakshmi Harams, Kasu Malas, and Peacock Mugappus for wedding rituals at a tiny fraction of the cost.
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">Next-Gen Shopping Experience</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We are the first traditional gold covering store to combine real heritage crafts with live camera Virtual Try-on (MediaPipe) and interactive 3D WebGL inspection, bringing our temple boutique right to your smartphone screen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

