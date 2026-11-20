const RentalBooking = require('../models/RentalBooking');

// @desc    Get all rentals with status and overdue detection
// @route   GET /api/rentals
// @access  Private (Admin)
exports.getRentals = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    const now = new Date();

    // Auto mark overdue for Active/Booked past end date
    await RentalBooking.updateMany(
      {
        status: { $in: ['Booked', 'Active/Picked Up'] },
        endDate: { $lt: now }
      },
      { status: 'Overdue' }
    );

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const rentals = await RentalBooking.find(query).sort({ startDate: -1 });

    res.json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update rental status (mark picked up / mark returned)
// @route   PUT /api/rentals/:id/status
// @access  Private (Admin)
exports.updateRentalStatus = async (req, res) => {
  try {
    const { status, depositStatus, notes } = req.body;
    const rental = await RentalBooking.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental record not found' });
    }

    if (status) rental.status = status;
    if (depositStatus) rental.depositStatus = depositStatus;
    if (notes !== undefined) rental.notes = notes;

    if (status === 'Returned' && !rental.returnedAt) {
      rental.returnedAt = new Date();
    }

    await rental.save();

    res.json({ success: true, data: rental });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

