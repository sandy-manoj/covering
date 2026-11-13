const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    default: 'Chidambaram Sri Thanga Covering'
  },
  tagline: {
    type: String,
    default: '1 Gram Pure Micro Gold Plated Chains & Bridal Rental Jewellery'
  },
  logo: {
    type: String,
    default: ''
  },
  whatsappNumber: {
    type: String,
    required: true,
    default: '919876543210' // Format: Country code without +, e.g. 919876543210
  },
  contactPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  contactEmail: {
    type: String,
    default: 'support@goldcoveringshop.com'
  },
  address: {
    street: { type: String, default: '144/2, Sannathi Street, Near Natarajar Temple' },
    city: { type: String, default: 'Chidambaram' },
    state: { type: String, default: 'Tamil Nadu' },
    pincode: { type: String, default: '608001' }
  },
  mapEmbedUrl: {
    type: String,
    default: 'https://maps.google.com/maps?q=Chidambaram%20Nataraja%20Temple&t=&z=15&ie=UTF8&iwloc=&output=embed'
  },
  socialLinks: {
    instagram: { type: String, default: 'https://instagram.com/goldcoveringshop' },
    facebook: { type: String, default: 'https://facebook.com/goldcoveringshop' },
    youtube: { type: String, default: 'https://youtube.com/@goldcoveringshop' }
  },
  shippingNotice: {
    type: String,
    default: 'Free Express Shipping Across India on orders above ₹999 | Cash on Delivery Available'
  },
  rentalTerms: {
    type: String,
    default: 'Rental requires 100% refundable security deposit returned within 24 hours of undamaged chain return.'
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);

