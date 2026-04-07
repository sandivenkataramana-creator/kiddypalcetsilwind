const db = require("../config/db");

// GET About content (public)
exports.getAbout = async (req, res) => {
  try {
    const sql = "SELECT content FROM about WHERE id = 1";
    const [rows] = await db.query(sql);
    
    if (!rows || rows.length === 0) {
      return res.json({ content: "Welcome to KiddyPalace" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching about content:", err);
    res.status(500).json({ error: "Failed to fetch about content" });
  }
};

// UPDATE About content (admin only)
exports.updateAbout = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const sql = "UPDATE about SET content = ? WHERE id = 1";
    await db.query(sql, [content]);
    
    res.json({ message: "About updated successfully" });
  } catch (err) {
    console.error("Error updating about content:", err);
    res.status(500).json({ error: "Failed to update about content" });
  }
};
