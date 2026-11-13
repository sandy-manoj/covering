const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  productCode: { type: String, required: true },
  orderType: { type: String, enum: ['Buy', 'Rent'], required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true },
  offerPrice: { type: Number, default: 0 },
  rentalDates: {
    startDate: { type: Date },
    endDate: { type: Date },
    totalDays: { type: Number, default: 0 },
    depositPerUnit: { type: Number, default: 0 }
  },
  customization: {
    text: { type: String, default: '' },
    font: { type: String, default: '' },
    pendantStyle: { type: String, default: '' },
    extraCharge: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  },
  lineTotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    deliveryType: { type: String, enum: ['Home Delivery', 'Store Pickup'], default: 'Home Delivery' },
    paymentPreference: { type: String, enum: ['UPI', 'Cash on Delivery', 'Store Pickup Payment'], default: 'UPI' },
    customerNotes: { type: String, default: '' }
  },
  items: [orderItemSchema],
  financials: {
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    depositTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Rented', 'Returned', 'Cancelled'],
    default: 'Pending'
  },
  whatsappMessageSent: {
    type: Boolean,
    default: true
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

