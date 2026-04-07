const express = require("express");
const router = express.Router();
const controller = require("../controllers/settingController");
const { authenticateAdmin } = require("../middleware/adminAuth");

// Back-compat single announcement
router.get("/top-announcement", controller.getAnnouncement);
router.post("/top-announcement", authenticateAdmin, controller.updateAnnouncement);

// New: full announcements management
router.get("/announcements", controller.getAnnouncements);
router.post("/announcements", authenticateAdmin, controller.addAnnouncement);
router.put("/announcements/:id", authenticateAdmin, controller.updateAnnouncementById);
router.delete("/announcements/:id", authenticateAdmin, controller.deleteAnnouncementById);

// Settings for announcements (display timing / gap)
router.get("/announcements/settings", authenticateAdmin, controller.getAnnouncementSettings);
router.put("/announcements/settings", authenticateAdmin, controller.updateAnnouncementSettings);

module.exports = router;
