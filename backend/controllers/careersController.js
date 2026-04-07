const db = require("../config/db");

// GET Careers content (public)
exports.getCareers = async (req, res) => {
  try {
    const sql = "SELECT content FROM careers WHERE id = 1";
    const [rows] = await db.query(sql);
    
    if (!rows || rows.length === 0) {
      return res.json({ content: "Join Our Team - We're always looking for talented individuals to join KiddyPalace!" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching careers content:", err);
    res.status(500).json({ error: "Failed to fetch careers content" });
  }
};

// UPDATE Careers content (admin only)
exports.updateCareers = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const sql = "UPDATE careers SET content = ? WHERE id = 1";
    await db.query(sql, [content]);
    
    res.json({ message: "Careers content updated successfully" });
  } catch (err) {
    console.error("Error updating careers content:", err);
    res.status(500).json({ error: "Failed to update careers content" });
  }
};
