

const pool = require("../config/db");
const path = require("path");

exports.getBrands = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id, b.name, b.logo_url
      FROM brands b
      INNER JOIN (
        SELECT MIN(id) AS id
        FROM brands
        GROUP BY name
      ) grouped ON b.id = grouped.id
      ORDER BY b.name
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch brands" });
  }
};


exports.addBrandSingle = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const name = path
    .basename(req.file.originalname, path.extname(req.file.originalname))
    .replace(/[-_]/g, " ")
    .replace(/\s+copy/i, "")
    .trim();

  const logoUrl = `/uploads/brands/${req.file.filename}`;

  await pool.query(
    "INSERT IGNORE INTO brands (name, logo_url) VALUES (?, ?)",
    [name, logoUrl]
  );

  res.json({ success: true, message: "Brand added" });
};

exports.addBrandsBulk = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    let inserted = 0;
    let skipped = 0;

    for (const file of req.files) {
      const rawName = path.parse(file.originalname).name;

      const cleanName = rawName
        .replace(/-?\s*copy/i, "")     // remove "- Copy"
        .replace(/\(\d+\)/g, "")       // remove (1), (2)
        .replace(/[_-]/g, " ")         // replace _ and -
        .replace(/\s+/g, " ")          // collapse spaces
        .trim()
        .toLowerCase();                // normalize case

      const logoUrl = `/uploads/brands/${file.filename}`;

      const [result] = await pool.query(
        "INSERT IGNORE INTO brands (name, logo_url) VALUES (?, ?)",
        [cleanName, logoUrl]
      );

      result.affectedRows ? inserted++ : skipped++;
    }

    res.json({
      success: true,
      message: `${inserted} brands added, ${skipped} duplicates skipped`
    });

  } catch (error) {
    console.error("Bulk brand upload error:", error);
    res.status(500).json({
      success: false,
      message: "Bulk upload failed"
    });
  }
};
/**
 * UPDATE BRAND NAME
 */
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required"
      });
    }

    const [result] = await pool.query(
      "UPDATE brands SET name = ? WHERE id = ?",
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    res.json({
      success: true,
      message: "Brand name updated successfully"
    });

  } catch (error) {
    console.error("Update brand error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update brand"
    });
  }
};