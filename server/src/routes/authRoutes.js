const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', adminLogin);
router.get('/me', protect, getAdminProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

