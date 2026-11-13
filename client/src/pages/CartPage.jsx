import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatCurrency } from '../utils/whatsapp';

const CartPage = () => {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getDiscountTotal, getDepositTotal, getGrandTotal } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <Sparkles className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          Explore our authentic Chidambaram gold covering rope, box, and bridal rental chains to add items.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg"
        >
          Explore Chains
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscountTotal();
  const deposit = getDepositTotal();
  const grandTotal = getGrandTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900">Shopping Cart</h1>
          <p className="text-xs text-stone-500 mt-1">{items.length} unique chain item(s) selected</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.itemKey}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image || '/images/products/chain_1.jpg'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.orderType === 'Rent' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.orderType.toUpperCase()}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{item.productCode}</span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 text-sm">{item.name}</h3>

                  {item.orderType === 'Rent' && item.rentalDates && (
                    <p className="text-[11px] text-purple-700 font-medium">
                      Rental: {new Date(item.rentalDates.startDate).toLocaleDateString()} to {new Date(item.rentalDates.endDate).toLocaleDateString()} ({item.rentalDates.totalDays} Days)
                    </p>
                  )}

                  {item.customization?.text && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      Pendant Text: "{item.customization.text}" (+₹{item.customization.extraCharge})
                    </p>
                  )}

                  <p className="text-xs font-semibold text-stone-900">
                    {formatCurrency(item.unitPrice + (item.customization?.extraCharge || 0))} each
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3">
                <div className="flex items-center border border-stone-300 rounded-full p-0.5 bg-stone-50">
                  <button
                    onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-white rounded-full"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-white rounded-full"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-stone-900 font-serif">
                    {formatCurrency(item.lineTotal)}
                  </span>
                  <button
                    onClick={() => removeItem(item.itemKey)}
                    className="text-stone-400 hover:text-rose-600 p-1 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Proceed to WhatsApp Checkout */}
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80 space-y-5">
          <h3 className="font-serif font-bold text-lg text-stone-900">Order Summary</h3>

          <div className="space-y-2.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">{formatCurrency(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Offer Savings</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}

            {deposit > 0 && (
              <div className="flex justify-between text-purple-800 font-semibold">
                <span>Refundable Rental Deposit</span>
                <span>+{formatCurrency(deposit)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Charge</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-stone-900">Grand Total</span>
              <span className="text-xl font-extrabold text-stone-900 font-serif">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs sm:text-sm"
          >
            <span>Proceed to Details & WhatsApp Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Guaranteed Micro Polish • 100% Secure Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

