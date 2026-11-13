import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, MessageSquare, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { createOrder, getSettings } from '../services/api';
import { formatCurrency, generateWhatsAppOrderUrl } from '../utils/whatsapp';
import confetti from 'canvas-confetti';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, clearCart, getSubtotal, getDiscountTotal, getDepositTotal, getGrandTotal } = useCartStore();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    deliveryType: 'Home Delivery', // 'Home Delivery' | 'Store Pickup'
    paymentPreference: 'UPI', // 'UPI' | 'Cash on Delivery' | 'Store Pickup Payment'
    customerNotes: ''
  });

  useEffect(() => {
    getSettings().then((res) => {
      if (res.data?.data) setSettings(res.data.data);
    }).catch(console.error);
  }, []);

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const discountTotal = getDiscountTotal();
  const depositTotal = getDepositTotal();
  const grandTotal = getGrandTotal();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert('Please fill out all required delivery fields.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customer: formData,
        items,
        financials: {
          subtotal,
          discountTotal,
          depositTotal,
          shippingFee: 0,
          grandTotal
        }
      };

      const res = await createOrder(orderPayload);
      const savedOrder = res.data?.data;
      const whatsappNumber = res.data?.whatsappNumber || settings?.whatsappNumber || '919876543210';
      const shopName = res.data?.shopName || settings?.shopName || 'Chidambaram Sri Thanga Covering';

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setOrderSuccess({
        order: savedOrder,
        whatsappUrl: generateWhatsAppOrderUrl(savedOrder, whatsappNumber, shopName)
      });

      // Clear local cart
      clearCart();

      // Open WhatsApp in a new window automatically
      window.open(generateWhatsAppOrderUrl(savedOrder, whatsappNumber, shopName), '_blank');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error creating order. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {!orderSuccess ? (
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Direct Store Checkout</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900 mt-1">
              Delivery Details & WhatsApp Order
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Your order is recorded securely in our system, and sent via WhatsApp to our store manager for instant confirmation & payment link.
            </p>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Delivery Form (Left 2 cols) */}
            <div className="md:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
              <h3 className="font-serif font-bold text-base text-stone-900 pb-2 border-b border-stone-100">
                1. Customer & Shipping Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Meenakshi Sundaram"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@gmail.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Door / Flat No, Street Address *</label>
                <textarea
                  rows={2}
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 42/B, North Sannathi Street"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">City / Town *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Chidambaram / Chennai"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 608001"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900 pt-3 pb-2 border-b border-stone-100">
                2. Preferences & Payment
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Delivery Choice</label>
                  <select
                    name="deliveryType"
                    value={formData.deliveryType}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    <option value="Home Delivery">Express Courier to Home</option>
                    <option value="Store Pickup">Pick up at Chidambaram Store</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Preferred Payment Mode</label>
                  <select
                    name="paymentPreference"
                    value={formData.paymentPreference}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    <option value="UPI">Google Pay / PhonePe / Paytm UPI</option>
                    <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    <option value="Store Pickup Payment">Pay at Store Counter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Additional Instructions / Notes</label>
                <textarea
                  rows={2}
                  name="customerNotes"
                  value={formData.customerNotes}
                  onChange={handleChange}
                  placeholder="e.g. Fast delivery needed before temple festival on Thursday..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>
            </div>

            {/* Order Brief & WhatsApp CTA (Right col) */}
            <div className="space-y-4">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-900">Your Items ({items.length})</h3>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-stone-500">
                          {item.orderType.toUpperCase()} x {item.quantity}
                          {item.customization?.text && ` • "${item.customization.text}"`}
                        </p>
                      </div>
                      <span className="font-bold text-stone-800">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {depositTotal > 0 && (
                    <div className="flex justify-between text-purple-800 font-semibold">
                      <span>Rental Deposit</span>
                      <span>+{formatCurrency(depositTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200 font-serif">
                    <span>Grand Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-full shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform active:scale-95 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{loading ? 'Recording Order...' : 'Place Order on WhatsApp 💬'}</span>
                </button>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>How WhatsApp Checkout Works:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-800">
                  <li>Your order is assigned a unique ID in our database.</li>
                  <li>WhatsApp opens with a clean itemized receipt pre-filled.</li>
                  <li>Our store executive immediately confirms your parcel.</li>
                </ol>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Order Confirmed Screen */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">Order Placed Successfully</span>
            <h2 className="text-3xl font-serif font-extrabold text-stone-900 mt-1">
              Order ID: <span className="text-amber-800">{orderSuccess.order.orderId}</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-2">
              Thank you, {orderSuccess.order.customer.fullName}! Your order has been saved with status <strong>Pending</strong>.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl max-w-md mx-auto border border-stone-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-500">Recipient:</span>
              <span className="font-semibold">{orderSuccess.order.customer.fullName} ({orderSuccess.order.customer.phone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Grand Total:</span>
              <span className="font-bold text-stone-900">{formatCurrency(orderSuccess.order.financials.grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Address:</span>
              <span className="font-semibold">{orderSuccess.order.customer.city}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={orderSuccess.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-full text-xs shadow-lg flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Re-open WhatsApp Message</span>
            </a>

            <button
              onClick={() => navigate('/shop')}
              className="bg-stone-900 hover:bg-black text-white font-semibold px-6 py-3 rounded-full text-xs"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

