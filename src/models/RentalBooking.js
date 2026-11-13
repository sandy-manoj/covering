const mongoose = require('mongoose');

const rentalBookingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productCode: { type: String, required: true },
  productName: { type: String, required: true },
  orderId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Booked', 'Active/Picked Up', 'Returned', 'Overdue', 'Cancelled'],
    default: 'Booked'
  },
  depositAmount: { type: Number, default: 0 },
  depositStatus: {
    type: String,
    enum: ['Held', 'Refunded', 'Deducted'],
    default: 'Held'
  },
  returnedAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Index for quickly finding overlapping dates
rentalBookingSchema.index({ product: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('RentalBooking', rentalBookingSchema);

