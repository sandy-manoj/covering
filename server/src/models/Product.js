const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  categoryName: {
    type: String,
    default: 'Chains'
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Buy', 'Rent', 'Both'],
    default: 'Both'
  },
  images: [{
    type: String,
    required: true
  }],
  tryOnImage: {
    type: String,
    default: '' // Transparent PNG with chain outline for virtual try-on
  },
  model3dUrl: {
    type: String,
    default: '' // .glb file url
  },
  spinImages360: [{
    type: String
  }],
  specs: {
    length: { type: String, default: '20 inches' },
    weight: { type: String, default: '25 grams' },
    thickness: { type: String, default: '3 mm' },
    style: { type: String, default: 'Rope' }, // rope, box, curb, figaro, mugappu, snake, traditional
    plating: { type: String, default: '1 Gram Micro Gold Plated (Guaranteed 1 Year Polish)' }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  hasOffer: {
    type: Boolean,
    default: false
  },
  offerPrice: {
    type: Number,
    default: 0
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  offerStartDate: {
    type: Date
  },
  offerEndDate: {
    type: Date
  },
  rental: {
    pricePerDay: { type: Number, default: 0 },
    pricePerWeek: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  customizable: {
    isCustomizable: { type: Boolean, default: false },
    extraPrice: { type: Number, default: 0 },
    allowedFonts: {
      type: [String],
      default: ['Cinzel Decorative', 'Playfair Display', 'Great Vibes', 'Montserrat']
    },
    samplePendants: {
      type: [String],
      default: ['Initial Letter', 'God Symbol / Om', 'Heart', 'Floral Mogappu']
    }
  },
  tryOnCalibration: {
    scale: { type: Number, default: 1.0 },
    offsetY: { type: Number, default: 0 },
    offsetX: { type: Number, default: 0 },
    anchor: { type: String, default: 'collarbone' }
  },
  stock: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

productSchema.pre('save', function() {
  if (this.hasOffer && this.offerPrice > 0 && this.price > 0) {
    this.discountPercentage = Math.round(((this.price - this.offerPrice) / this.price) * 100);
  } else if (!this.hasOffer) {
    this.discountPercentage = 0;
  }
});

module.exports = mongoose.model('Product', productSchema);
