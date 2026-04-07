const express = require("express");
const router = express.Router();
const {
  getAbout,
  updateAbout,
} = require("../controllers/aboutController");

// use SAME admin middleware you already have
const { authenticateAdmin } = require("../middleware/adminAuth");

router.get("/", getAbout);                 // public
router.put("/", authenticateAdmin, updateAbout);   // admin only

module.exports = router;
