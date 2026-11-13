const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  badge: { type: String, default: 'EXCLUSIVE COLLECTION' },
  image: { type: String, required: true },
  linkUrl: { type: String, default: '/shop' },
  buttonText: { type: String, default: 'Explore Collection' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);

