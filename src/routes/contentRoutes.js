const express = require('express');
const router = express.Router();
const {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  getSettings,
  updateSettings
} = require('../controllers/contentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Categories
router.get('/categories', getCategories);
router.get('/admin/categories', protect, getAllCategoriesAdmin);
router.post('/categories', protect, createCategory);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);

// Banners
router.get('/banners', getBanners);
router.get('/admin/banners', protect, getAllBannersAdmin);
router.post('/banners', protect, createBanner);
router.put('/banners/:id', protect, updateBanner);
router.delete('/banners/:id', protect, deleteBanner);

// Settings
router.get('/settings', getSettings);
router.put('/settings', protect, updateSettings);

// File Upload endpoint (Images & GLB 3D models)
router.post('/upload', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  // Support both local server path or relative URL
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

module.exports = router;

