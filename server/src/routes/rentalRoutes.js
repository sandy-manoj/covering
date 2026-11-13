const express = require('express');
const router = express.Router();
const { getRentals, updateRentalStatus } = require('../controllers/rentalController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRentals);
router.put('/:id/status', protect, updateRentalStatus);

module.exports = router;

