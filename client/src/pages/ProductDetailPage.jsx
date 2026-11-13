import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Eye, ShoppingBag, ShieldCheck, Heart, Truck, RefreshCw, Calendar, Check, AlertCircle, Plus, Minus } from 'lucide-react';
import { getProductById, checkRentalAvailability, getSettings } from '../services/api';
import { useCartStore, useWishlistStore } from '../store/useCartStore';
import { formatCurrency, generateSingleProductWhatsAppUrl } from '../utils/whatsapp';
import Product3DViewerModal from '../components/viewer3d/Product3DViewerModal';
import VirtualTryOnModal from '../components/tryon/VirtualTryOnModal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Buy vs Rent active tab (if product supports Both)
  const [purchaseMode, setPurchaseMode] = useState('Buy'); // 'Buy' or 'Rent'
  const [quantity, setQuantity] = useState(1);

  // Customization Section states
  const [customText, setCustomText] = useState('');
  const [customFont, setCustomFont] = useState('Cinzel Decorative');
  const [customPendantStyle, setCustomPendantStyle] = useState('Initial Letter');
  const [customNotes, setCustomNotes] = useState('');

  // Rental Dates Section
  const [rentalStart, setRentalStart] = useState('');
  const [rentalEnd, setRentalEnd] = useState('');
  const [rentalDays, setRentalDays] = useState(1);
  const [rentalAvailable, setRentalAvailable] = useState(true);
  const [rentalChecking, setRentalChecking] = useState(false);

  // Modals
  const [showTryOn, setShowTryOn] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const addItemToCart = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    getProductById(id).then((res) => {
      const p = res.data?.data;
      setProduct(p);
      if (p.type === 'Rent') {
        setPurchaseMode('Rent');
      } else {
        setPurchaseMode('Buy');
      }
      setLoading(false);
    }).catch(console.error);

    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);
  }, [id]);

  // Compute rental days
  useEffect(() => {
    if (rentalStart && rentalEnd) {
      const start = new Date(rentalStart);
      const end = new Date(rentalEnd);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const days = diffDays > 0 ? diffDays : 1;
      setRentalDays(days);

      // Check conflict via backend
      setRentalChecking(true);
      checkRentalAvailability(product?._id, { startDate: rentalStart, endDate: rentalEnd })
        .then((res) => {
          setRentalAvailable(res.data?.isAvailable);
          setRentalChecking(false);
        })
        .catch(() => setRentalChecking(false));
    }
  }, [rentalStart, rentalEnd, product]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-16 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif">Product Not Found</h2>
        <Link to="/shop" className="text-amber-700 underline text-sm mt-2 inline-block">Return to Shop</Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);
  const buyPrice = product.hasOffer && product.offerPrice > 0 ? product.offerPrice : product.price;

  // Rental calculation
  const rentalRatePerDay = product.rental?.pricePerDay || 150;
  const rentalBaseTotal = rentalRatePerDay * rentalDays;
  const rentalDeposit = (product.rental?.deposit || 800) * quantity;

  // Customization charge
  const customCharge = (product.customizable?.isCustomizable && customText.trim()) 
    ? (product.customizable?.extraPrice || 0) 
    : 0;

  const handleAddToCart = () => {
    if (purchaseMode === 'Rent' && (!rentalStart || !rentalEnd)) {
      showToast('⚠️ Please select rental Start & Return dates');
      return;
    }

    if (purchaseMode === 'Rent' && !rentalAvailable) {
      showToast('⚠️ Chain is already booked for these dates. Choose another range.');
      return;
    }

    const unitPrice = purchaseMode === 'Rent' ? rentalBaseTotal : buyPrice;
    const lineTotal = (unitPrice + customCharge) * quantity;

    const cartPayload = {
      product: product._id,
      name: product.name,
      productCode: product.productCode,
      orderType: purchaseMode,
      image: product.images?.[0] || '/images/products/chain_1.jpg',
      quantity,
      unitPrice,
      offerPrice: product.hasOffer ? product.offerPrice : 0,
      rentalDates: purchaseMode === 'Rent' ? {
        startDate: rentalStart,
        endDate: rentalEnd,
        totalDays: rentalDays,
        depositPerUnit: product.rental?.deposit || 800
      } : undefined,
      customization: product.customizable?.isCustomizable && customText.trim() ? {
        text: customText.trim(),
        font: customFont,
        pendantStyle: customPendantStyle,
        extraCharge: customCharge,
        notes: customNotes
      } : undefined,
      lineTotal
    };

    addItemToCart(cartPayload);
    showToast(`✅ "${product.name}" added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 animate-slideUp">
          {toastMessage}
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="text-xs text-stone-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-700">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-amber-700">Chains</Link>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase (Lenskart Inspired) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Image Gallery & [Try On] [360°] Buttons */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-stone-50 rounded-3xl overflow-hidden border border-stone-200/80 shadow-md group">
            
            {/* Main Image */}
            <img
              src={product.images?.[activeImageIndex] || '/images/products/chain_1.jpg'}
              alt={product.name}
              className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
            />

            {/* Offer Discount Badge */}
            {product.hasOffer && product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                {product.discountPercentage}% OFF
              </span>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-xs text-stone-600 hover:text-rose-500 shadow-md transition-all"
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* TWO BOTTOM-LEFT BUTTONS (Lenskart Style): [ Try on ] and [ 360° / 3D ] */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-20">
              <button
                onClick={() => setShowTryOn(true)}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 transition-transform active:scale-95 border border-amber-400"
              >
                <Sparkles className="w-4 h-4 text-stone-900" />
                <span>Try on (Camera)</span>
              </button>

              <button
                onClick={() => setShow3D(true)}
                className="bg-stone-900/90 hover:bg-black text-amber-300 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 transition-transform active:scale-95 border border-stone-700"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>360° / 3D</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-stone-50 ${
                    activeImageIndex === idx ? 'border-amber-600 shadow-md scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info, Pricing, Mode Tabs, Customization, WhatsApp CTA */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">{product.categoryName || 'Chains'}</span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500">Code: <strong>{product.productCode}</strong></span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Mode Switcher Tabs if product supports both Buy & Rent */}
          {product.type === 'Both' && (
            <div className="flex border-b border-stone-200">
              <button
                onClick={() => setPurchaseMode('Buy')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
                  purchaseMode === 'Buy'
                    ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                Buy Permanent (₹{buyPrice})
              </button>
              <button
                onClick={() => setPurchaseMode('Rent')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
                  purchaseMode === 'Rent'
                    ? 'border-purple-600 text-purple-900 bg-purple-50/50'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                Rent for Wedding / Event (₹{product.rental?.pricePerDay}/day)
              </button>
            </div>
          )}

          {/* Pricing Block */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            {purchaseMode === 'Buy' ? (
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-stone-900 font-serif">
                    {formatCurrency(buyPrice)}
                  </span>
                  {product.hasOffer && product.offerPrice > 0 && (
                    <span className="text-sm text-stone-400 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                  {product.hasOffer && product.discountPercentage > 0 && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Save {formatCurrency(product.price - product.offerPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">Inclusive of all taxes • Guaranteed 1-year micro polish certificate included</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-purple-900 font-serif">
                      ₹{rentalRatePerDay} / day
                    </span>
                    <span className="text-xs text-stone-500 block">Weekly bundle: ₹{product.rental?.pricePerWeek || 600}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-700">Refundable Deposit:</span>
                    <span className="text-sm font-extrabold text-stone-900 block">₹{product.rental?.deposit || 800}</span>
                  </div>
                </div>

                {/* Rental Date Picker */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Pick-up / Delivery Date</label>
                    <input
                      type="date"
                      value={rentalStart}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRentalStart(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Return Date</label>
                    <input
                      type="date"
                      value={rentalEnd}
                      min={rentalStart || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRentalEnd(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {rentalStart && rentalEnd && (
                  <div className="text-xs p-2.5 rounded-lg bg-purple-100/60 text-purple-900 flex items-center justify-between">
                    <span>Duration: <strong>{rentalDays} Day(s)</strong></span>
                    <span>Rental Total: <strong>₹{rentalBaseTotal}</strong> (+ ₹{rentalDeposit} Deposit)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Length</span>
              <span className="font-semibold text-stone-900">{product.specs?.length || '22 inches'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Weight Approx</span>
              <span className="font-semibold text-stone-900">{product.specs?.weight || '25 grams'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Thickness / Width</span>
              <span className="font-semibold text-stone-900">{product.specs?.thickness || '3.5 mm'}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Gold Plating</span>
              <span className="font-semibold text-stone-900">{product.specs?.plating || '1-Gram 24K Micro Plated'}</span>
            </div>
          </div>

          {/* Customization Section (Optional per product) */}
          {product.customizable?.isCustomizable && (
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Personalize with Name / Initial (+₹{product.customizable?.extraPrice || 200})
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Custom Option</span>
              </div>

              <div>
                <label className="text-xs text-stone-700 block mb-1">Enter Name or Initials (e.g. "Ravi", "M", "S&K"):</label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="Your text here..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full text-sm p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-600 uppercase font-bold tracking-widest text-amber-900"
                />
              </div>

              {/* Live Preview Text next to chain motif */}
              {customText.trim() && (
                <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs text-stone-500">Live Pendant Preview:</span>
                  <span
                    className="text-lg font-bold text-amber-800 tracking-wider shadow-xs px-3 py-1 bg-amber-50 rounded-lg border border-amber-200"
                    style={{ fontFamily: customFont === 'Cinzel Decorative' ? 'serif' : 'cursive' }}
                  >
                    ✨ {customText} ✨
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector & CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-full p-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 text-stone-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add To Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-stone-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Add to Cart ({purchaseMode})</span>
              </button>
            </div>

            {/* Direct Buy via WhatsApp button */}
            <a
              href={generateSingleProductWhatsAppUrl(product, settings?.whatsappNumber, settings?.shopName)}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <span>Buy Directly on WhatsApp 💬</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-2 gap-4 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>1-Year Polish Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Free Delivery Above ₹999</span>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      <VirtualTryOnModal
        isOpen={showTryOn}
        product={product}
        onClose={() => setShowTryOn(false)}
      />

      {/* 3D / 360 Viewer Modal */}
      <Product3DViewerModal
        isOpen={show3D}
        product={product}
        onClose={() => setShow3D(false)}
      />
    </div>
  );
};

export default ProductDetailPage;

