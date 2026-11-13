import React, { useState } from 'react';
import { Share2, Check, MessageCircle, Link as LinkIcon, X, Send } from 'lucide-react';

const ProductShareModal = ({ product, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !product) return null;

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/product/${product._id}` 
    : '';

  const shareText = `Check out this authentic 1-Gram Gold Covering chain: ${product.name} (₹${product.offerPrice || product.price}) from Singapore Fancy & Covering, Vandavasi! ✨`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: currentUrl
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-stone-900 border border-amber-600/50 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif font-bold text-base">Share with Friends</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product mini preview card */}
        <div className="flex items-center gap-3 p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
          <img
            src={product.images?.[0] || product.image || '/images/products/chain_1.jpg'}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl border border-amber-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-serif font-bold text-sm text-stone-200 truncate">{product.name}</h4>
            <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
              ₹{product.offerPrice || product.price}
            </p>
          </div>
        </div>

        {/* Quick Share action buttons */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 hover:bg-emerald-900 transition-colors text-emerald-300"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Share on WhatsApp</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-950/80 border border-amber-600/50 hover:bg-amber-900 transition-colors text-amber-300"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center shadow-md">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold">Share to Apps</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-2 bg-stone-950 rounded-2xl border border-stone-800">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-xs text-stone-300 px-2 focus:outline-hidden truncate"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductShareModal;
