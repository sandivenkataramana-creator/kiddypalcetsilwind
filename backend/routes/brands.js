// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const { getBrands, addBrandsBulk } = require("../controllers/brandController");

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/brands");
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// // Routes
// router.get("/", getBrands);

// // ✅ BULK upload route
// router.post("/", upload.array("logos", 50), addBrandsBulk);

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const path = require("path");


// const {
//   getBrands,
//   addBrandSingle,
//   addBrandsBulk
// } = require("../controllers/brandController");


// const brandUploadDir = path.join(__dirname, "../uploads/brands");

// if (!fs.existsSync(brandUploadDir)) {
//   fs.mkdirSync(brandUploadDir, { recursive: true });
// }


// // Multer config
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/brands");
// //   },
// //   filename: (req, file, cb) => {
// //     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
// //     cb(null, unique + path.extname(file.originalname));
// //   },
// // });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, brandUploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });


// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("Only image files are allowed"), false);
//     }
//     cb(null, true);
//   },
// });


// // GET brands
// router.get("/", getBrands);

// // ✅ SINGLE BRAND
// router.post("/single", upload.single("logo"), addBrandSingle);

// // ✅ BULK BRANDS
// router.post("/bulk", upload.array("logos", 50), addBrandsBulk);

// module.exports = router;


const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("../config/db"); 
const { authenticateAdmin } = require("../middleware/adminAuth");

const {
  getBrands,
  addBrandSingle,
  addBrandsBulk,
  updateBrand,
} = require("../controllers/brandController");

// =======================
// Ensure upload folder
// =======================
const brandUploadDir = path.join(__dirname, "../uploads/brands");
if (!fs.existsSync(brandUploadDir)) {
  fs.mkdirSync(brandUploadDir, { recursive: true });
}

// =======================
// Multer config
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, brandUploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: {
    files: 200,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
  },
});

// =======================
// Routes
// =======================
router.get("/", getBrands);
router.post("/single", upload.single("logo"), addBrandSingle);
router.post("/bulk", upload.array("logos", 200), addBrandsBulk);

// =======================
// UPDATE brand name (ADMIN ONLY)
// =======================
router.put("/:id", authenticateAdmin, updateBrand);

// =======================
// DELETE brand (ADMIN ONLY)
// =======================
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const brandId = req.params.id;

    const [rows] = await db.query(
      "SELECT logo_url FROM brands WHERE id = ?",
      [brandId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const logoUrl = rows[0].logo_url;

    await db.query("DELETE FROM brands WHERE id = ?", [brandId]);

    if (logoUrl) {
      const imagePath = path.join(__dirname, "..", logoUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true, message: "Brand deleted" });
  } catch (err) {
    console.error("Delete brand error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;
