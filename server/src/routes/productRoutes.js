const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  checkRentalAvailability,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/rental-availability', checkRentalAvailability);

// Admin routes
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;

