const express = require("express");
const router = express.Router();
const {
  getCareers,
  updateCareers,
} = require("../controllers/careersController");

// use SAME admin middleware you already have
const { authenticateAdmin } = require("../middleware/adminAuth");

router.get("/", getCareers);                 // public
router.put("/", authenticateAdmin, updateCareers);   // admin only

module.exports = router;
