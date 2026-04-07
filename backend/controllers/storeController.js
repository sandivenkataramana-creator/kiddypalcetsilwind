const db = require('../config/db');

exports.getStores = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stores ORDER BY id DESC');
    res.json({ success: true, stores: rows });
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, store: rows[0] });
  } catch (err) {
    console.error('Get store by id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createStore = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      postal_code,
      phone,
      email,
      latitude,
      longitude,
      image_url,
      open_hours,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name required' });

    const [result] = await db.query(
      `INSERT INTO stores (name, address, city, state, postal_code, phone, email, latitude, longitude, image_url, open_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address || null, city || null, state || null, postal_code || null, phone || null, email || null, latitude || null, longitude || null, image_url || null, open_hours || null]
    );

    res.status(201).json({ success: true, storeId: result.insertId });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      city,
      state,
      postal_code,
      phone,
      email,
      latitude,
      longitude,
      image_url,
      open_hours,
    } = req.body;

    const [result] = await db.query(
      `UPDATE stores SET name = ?, address = ?, city = ?, state = ?, postal_code = ?, phone = ?, email = ?, latitude = ?, longitude = ?, image_url = ?, open_hours = ? WHERE id = ?`,
      [name, address || null, city || null, state || null, postal_code || null, phone || null, email || null, latitude || null, longitude || null, image_url || null, open_hours || null, id]
    );

    res.json({ success: true, message: 'Updated' });
  } catch (err) {
    console.error('Update store error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM stores WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('Delete store error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Upload store image and update store.image_url
exports.uploadStoreImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

    // Save path relative to public root (consistent with other uploads)
    const imagePath = `/uploads/stores/${req.file.filename}`;

    await db.query('UPDATE stores SET image_url = ? WHERE id = ?', [imagePath, id]);

    res.json({ success: true, image_url: imagePath });
  } catch (err) {
    console.error('Upload store image error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
