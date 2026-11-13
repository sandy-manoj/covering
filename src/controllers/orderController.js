const Order = require('../models/Order');
const RentalBooking = require('../models/RentalBooking');
const Settings = require('../models/Settings');
const Product = require('../models/Product');

// Helper to generate unique order ID: GC-YYYY-XXXX
const generateOrderId = async () => {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments();
  const serial = String(count + 1).padStart(4, '0');
  return `GC-${year}-${serial}`;
};

// @desc    Place order via WhatsApp checkout
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const { customer, items, financials } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    if (!customer || !customer.fullName || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone and address are required' });
    }

    // Double check rental items overlap conflict prevention
    for (const item of items) {
      if (item.orderType === 'Rent' && item.rentalDates && item.rentalDates.startDate && item.rentalDates.endDate) {
        const start = new Date(item.rentalDates.startDate);
        const end = new Date(item.rentalDates.endDate);

        const conflict = await RentalBooking.findOne({
          product: item.product,
          status: { $in: ['Booked', 'Active/Picked Up'] },
          $or: [
            { startDate: { $lte: end }, endDate: { $gte: start } }
          ]
        });

        if (conflict) {
          return res.status(400).json({
            success: false,
            message: `Rental chain "${item.name}" is already booked for dates ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}. Please select other dates.`
          });
        }
      }
    }

    const orderId = await generateOrderId();

    const order = new Order({
      orderId,
      customer,
      items,
      financials
    });

    await order.save();

    // Create rental bookings if there are rental items
    for (const item of items) {
      if (item.orderType === 'Rent' && item.rentalDates && item.rentalDates.startDate && item.rentalDates.endDate) {
        const booking = new RentalBooking({
          product: item.product,
          productCode: item.productCode,
          productName: item.name,
          orderId: order.orderId,
          customerName: customer.fullName,
          customerPhone: customer.phone,
          startDate: new Date(item.rentalDates.startDate),
          endDate: new Date(item.rentalDates.endDate),
          depositAmount: item.rentalDates.depositPerUnit * item.quantity,
          status: 'Booked'
        });
        await booking.save();
      }
    }

    // Fetch store settings for WhatsApp phone number
    const settings = await Settings.findOne() || {
      whatsappNumber: '919876543210',
      shopName: 'Chidambaram Sri Thanga Covering'
    };

    res.status(201).json({
      success: true,
      data: order,
      whatsappNumber: settings.whatsappNumber,
      shopName: settings.shopName
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get all orders with search & status filters
// @route   GET /api/orders
// @access  Private (Admin)
exports.getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.fullName': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.city': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;

    await order.save();

    // If order is cancelled, cancel corresponding rental bookings
    if (status === 'Cancelled') {
      await RentalBooking.updateMany(
        { orderId: order.orderId },
        { status: 'Cancelled' }
      );
    } else if (status === 'Returned') {
      await RentalBooking.updateMany(
        { orderId: order.orderId },
        { status: 'Returned', returnedAt: new Date(), depositStatus: 'Refunded' }
      );
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Dashboard stats
// @route   GET /api/orders/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const rentalProducts = await Product.countDocuments({ type: { $in: ['Rent', 'Both'] }, isActive: true });
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const activeRentals = await RentalBooking.countDocuments({ status: { $in: ['Booked', 'Active/Picked Up'] } });
    const lowStockProducts = await Product.find({ stock: { $lte: 3 }, isActive: true }).select('name productCode stock');

    // Last 7 days orders aggregate
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          totalSales: { $sum: "$financials.grandTotal" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        rentalProducts,
        ordersToday,
        pendingOrders,
        activeRentals,
        lowStockProducts,
        dailyOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

