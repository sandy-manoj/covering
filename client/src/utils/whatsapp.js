export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const generateWhatsAppOrderUrl = (order, whatsappNumber, shopName = 'Chidambaram Sri Thanga Covering') => {
  const cleanNumber = (whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

  let text = `👑 *NEW ORDER - ${shopName.toUpperCase()}* 👑\n\n`;
  text += `🧾 *Order ID:* ${order.orderId}\n`;
  text += `👤 *Customer:* ${order.customer.fullName}\n`;
  text += `📞 *Phone:* ${order.customer.phone}\n`;
  text += `📍 *Delivery Address:*\n${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}\n`;
  text += `🚚 *Mode:* ${order.customer.deliveryType} | *Payment:* ${order.customer.paymentPreference}\n\n`;
  text += `-----------------------------------------\n`;
  text += `📦 *ORDER ITEMS (${order.items.length}):*\n`;
  text += `-----------------------------------------\n`;

  order.items.forEach((item, index) => {
    text += `${index + 1}. *${item.name}* (${item.productCode})\n`;
    text += `   • Type: ${item.orderType.toUpperCase()} | Qty: ${item.quantity}\n`;
    
    if (item.orderType === 'Rent' && item.rentalDates) {
      const start = new Date(item.rentalDates.startDate).toLocaleDateString('en-IN');
      const end = new Date(item.rentalDates.endDate).toLocaleDateString('en-IN');
      text += `   • Rental Period: ${start} to ${end} (${item.rentalDates.totalDays} Days)\n`;
      text += `   • Refundable Deposit: ₹${item.rentalDates.depositPerUnit * item.quantity}\n`;
    }

    if (item.customization && item.customization.text) {
      text += `   • Custom Name/Text: "${item.customization.text}" (${item.customization.font || 'Standard'})\n`;
      if (item.customization.notes) {
        text += `   • Note: ${item.customization.notes}\n`;
      }
    }

    text += `   • Price: ₹${item.unitPrice} each ➔ Line Total: ₹${item.lineTotal}\n\n`;
  });

  text += `-----------------------------------------\n`;
  text += `💰 *BILLING SUMMARY:*\n`;
  text += `• Subtotal: ₹${order.financials.subtotal}\n`;
  if (order.financials.discountTotal > 0) {
    text += `• Offer Discount: -₹${order.financials.discountTotal}\n`;
  }
  if (order.financials.depositTotal > 0) {
    text += `• Security Deposit (Refundable): ₹${order.financials.depositTotal}\n`;
  }
  text += `• Shipping: ${order.financials.shippingFee === 0 ? 'FREE' : '₹' + order.financials.shippingFee}\n`;
  text += `🌟 *GRAND TOTAL: ₹${order.financials.grandTotal}*\n`;
  text += `-----------------------------------------\n`;

  if (order.customer.customerNotes) {
    text += `📝 *Notes:* ${order.customer.customerNotes}\n\n`;
  }

  text += `Please confirm my order and share payment/dispatch details. Thank you!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

export const generateSingleProductWhatsAppUrl = (product, whatsappNumber, shopName = 'Chidambaram Sri Thanga Covering') => {
  const cleanNumber = (whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
  const price = product.hasOffer && product.offerPrice ? product.offerPrice : product.price;

  let text = `Hello *${shopName}*, I am interested in purchasing this chain:\n\n`;
  text += `✨ *Product:* ${product.name}\n`;
  text += `🏷️ *Code:* ${product.productCode}\n`;
  text += `💰 *Price:* ₹${price} (Length: ${product.specs?.length || '22 inches'})\n`;
  text += `🔗 *Link:* ${window.location.origin}/product/${product._id}\n\n`;
  text += `Please let me know about availability and delivery!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

