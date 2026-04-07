// // const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/multer');
// const adminController = require('../controllers/adminController');


// // Auth controllers
// const {
//   adminLogin,
//   verifyAdmin,
//   adminLogout,
//   changePassword,
//   createAdmin
// } = require('../controllers/adminAuthController');

// // Middleware
// const { authenticateAdmin, requireSuperAdmin } = require('../middleware/adminAuth');
// const upload = require('../middleware/multer');

// // Controller for product image upload
// const adminController = require('../controllers/adminController');


// // ================= PUBLIC ROUTES =================
// router.post('/login', adminLogin);


// // ================= PROTECTED ROUTES =================
// router.get('/verify', authenticateAdmin, verifyAdmin);
// router.post('/logout', authenticateAdmin, adminLogout);
// router.post('/change-password', authenticateAdmin, changePassword);


// // ================= SUPER ADMIN ROUTES =================
// router.post(
//   '/create-admin',
//   authenticateAdmin,
//   requireSuperAdmin,
//   createAdmin
// );


// // ================= 🔥 PRODUCT IMAGE UPLOAD (ADMIN ONLY) =================
// router.post(
//   '/products/:id/images',
//   authenticateAdmin,              // admin must be logged in
//   upload.array('images', 10),     // accept multiple images
//   adminController.uploadProductImages
// );


// // 🔐 Admin – Upload product images
// router.post(
//   '/products/:id/images',
//   authenticateAdmin,
//   upload.array('images', 10),
//   adminController.uploadProductImages
// );

// module.exports = router;

const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const productController = require('../controllers/productController');

// Auth controllers
const {
  adminLogin,
  verifyAdmin,
  adminLogout,
  changePassword,
  createAdmin
} = require('../controllers/adminAuthController');

// Middleware
const {
  authenticateAdmin,
  requireSuperAdmin
} = require('../middleware/adminAuth');

// ================= PUBLIC ROUTES =================
router.post('/login', adminLogin);

// ================= PROTECTED ROUTES =================
router.get('/verify', authenticateAdmin, verifyAdmin);
router.post('/logout', authenticateAdmin, adminLogout);
router.post('/change-password', authenticateAdmin, changePassword);

// ================= SUPER ADMIN ROUTES =================
router.post(
  '/create-admin',
  authenticateAdmin,
  requireSuperAdmin,
  createAdmin
);

// ================= PRODUCT IMAGE UPLOAD =================
router.post(
  '/products/:id/images',
  authenticateAdmin,
  upload.array('images', 10),
  productController.uploadProductImages
);

module.exports = router;

