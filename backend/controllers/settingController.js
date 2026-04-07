const fs = require("fs");
const path = require("path");
const settingsPath = path.join(__dirname, "..", "settings.json");

// Helper: read settings (async)
function readSettings() {
  return new Promise((resolve, reject) => {
    fs.readFile(settingsPath, "utf8", (err, data) => {
      if (err) return reject(err);
      try {
        const json = JSON.parse(data || "{}");
        resolve(json);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

// Helper: write settings (atomic-ish: write temp then rename)
function writeSettings(obj) {
  return new Promise((resolve, reject) => {
    const tmpPath = settingsPath + ".tmp";
    const data = JSON.stringify(obj, null, 2);
    fs.writeFile(tmpPath, data, "utf8", (err) => {
      if (err) return reject(err);
      fs.rename(tmpPath, settingsPath, (renameErr) => {
        if (renameErr) return reject(renameErr);
        resolve();
      });
    });
  });
}

// Legacy: single announcement getter (kept for backward compatibility)
exports.getAnnouncement = async (req, res) => {
  try {
    const settings = await readSettings();
    // If new announcements array exists, return first item text for compatibility
    if (Array.isArray(settings.announcements) && settings.announcements.length > 0) {
      return res.json({ announcement: settings.announcements[0].text });
    }
    return res.json({ announcement: settings.announcement ?? "" });
  } catch (err) {
    console.error("Error reading settings:", err);
    res.status(500).json({ error: "Failed to read announcement" });
  }
};

// New: return full list + settings
exports.getAnnouncements = async (req, res) => {
  try {
    const settings = await readSettings();
    const announcements = Array.isArray(settings.announcements)
      ? settings.announcements
      : (settings.announcement ? [{ id: Date.now(), text: settings.announcement }] : []);

    const annSettings = settings.announcement_settings || { displayDuration: 5000, gapDuration: 1000 };

    res.json({ announcements, settings: annSettings });
  } catch (err) {
    console.error("Error reading announcements:", err);
    res.status(500).json({ error: "Failed to read announcements" });
  }
};

// Add a new announcement
exports.addAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Invalid announcement text" });
    }
    const trimmed = text.trim().slice(0, 2000);
    const settings = await readSettings();
    const current = Array.isArray(settings.announcements) ? settings.announcements.slice() : [];
    const id = Date.now();
    const newAnn = { id, text: trimmed };
    current.push(newAnn);
    settings.announcements = current;
    await writeSettings(settings);
    res.json({ success: true, announcement: newAnn });
  } catch (err) {
    console.error("Error adding announcement:", err);
    res.status(500).json({ error: "Failed to add announcement" });
  }
};

// Update specific announcement by id
exports.updateAnnouncementById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { text } = req.body;
    if (!id || typeof text !== "string") {
      return res.status(400).json({ error: "Invalid request" });
    }
    const trimmed = text.trim().slice(0, 2000);
    const settings = await readSettings();
    const current = Array.isArray(settings.announcements) ? settings.announcements : [];
    const idx = current.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ error: "Announcement not found" });
    current[idx].text = trimmed;
    settings.announcements = current;
    await writeSettings(settings);
    res.json({ success: true, announcement: current[idx] });
  } catch (err) {
    console.error("Error updating announcement:", err);
    res.status(500).json({ error: "Failed to update announcement" });
  }
};

// Delete announcement by id
exports.deleteAnnouncementById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid id" });
    const settings = await readSettings();
    const current = Array.isArray(settings.announcements) ? settings.announcements : [];
    const newList = current.filter((a) => a.id !== id);
    settings.announcements = newList;
    await writeSettings(settings);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
};

// Get announcement display settings
exports.getAnnouncementSettings = async (req, res) => {
  try {
    const settings = await readSettings();
    const annSettings = settings.announcement_settings || { displayDuration: 5000, gapDuration: 1000 };
    res.json({ settings: annSettings });
  } catch (err) {
    console.error("Error reading announcement settings:", err);
    res.status(500).json({ error: "Failed to read announcement settings" });
  }
};

// Update announcement display settings
exports.updateAnnouncementSettings = async (req, res) => {
  try {
    const { displayDuration, gapDuration } = req.body;
    const settings = await readSettings();
    const annSettings = settings.announcement_settings || { displayDuration: 5000, gapDuration: 1000 };
    if (typeof displayDuration === 'number') annSettings.displayDuration = Math.max(500, displayDuration);
    if (typeof gapDuration === 'number') annSettings.gapDuration = Math.max(0, gapDuration);
    settings.announcement_settings = annSettings;
    await writeSettings(settings);
    res.json({ success: true, settings: annSettings });
  } catch (err) {
    console.error("Error updating announcement settings:", err);
    res.status(500).json({ error: "Failed to update announcement settings" });
  }
};

// Back-compat: update single announcement string (kept for older callers)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { announcement } = req.body;
    if (typeof announcement !== "string") {
      return res.status(400).json({ error: "Invalid announcement" });
    }

    const trimmed = announcement.trim().slice(0, 2000); // limit length
    const settings = await readSettings();
    // Keep legacy field and also sync announcements array
    settings.announcement = trimmed;
    settings.announcements = [{ id: Date.now(), text: trimmed }];

    await writeSettings(settings);

    res.json({ success: true, message: "Announcement updated", announcement: trimmed });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: "Failed to update announcement" });
  }
};

