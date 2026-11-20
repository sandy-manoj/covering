const Product = require('../models/Product');
const RentalBooking = require('../models/RentalBooking');

// @desc    Get all products with filters & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      type, // Buy, Rent, Both
      category,
      style,
      minPrice,
      maxPrice,
      offersOnly,
      search,
      sort,
      page = 1,
      limit = 20,
      featured,
      newArrival,
      bestSeller
    } = req.query;

    let query = { isActive: true };

    if (type && type !== 'All') {
      if (type === 'Buy') {
        query.type = { $in: ['Buy', 'Both'] };
      } else if (type === 'Rent') {
        query.type = { $in: ['Rent', 'Both'] };
      }
    }

    if (category) {
      query.categoryName = { $regex: new RegExp(category, 'i') };
    }

    if (style) {
      query['specs.style'] = { $regex: new RegExp(style, 'i') };
    }

    if (offersOnly === 'true' || offersOnly === true) {
      query.hasOffer = true;
    }

    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { productCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'specs.style': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    else if (sort === 'price_desc') sortOptions = { price: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'discount') sortOptions = { discountPercentage: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID or Product Code
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
    let product;

    if (isObjectId) {
      product = await Product.findById(req.params.id);
    } else {
      product = await Product.findOne({ productCode: req.params.id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check rental availability for dates
// @route   GET /api/products/:id/rental-availability
// @access  Public
exports.checkRentalAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingBookings = await RentalBooking.find({
      product: req.params.id,
      status: { $in: ['Booked', 'Active/Picked Up'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      success: true,
      isAvailable,
      conflictsCount: conflictingBookings.length,
      message: isAvailable ? 'Available for selected dates' : 'Product is already booked for these dates'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Create product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

