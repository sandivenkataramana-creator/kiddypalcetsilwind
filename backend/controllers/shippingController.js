const db = require('../config/db');

// Utility to log request info
const logReq = (prefix, req) => {
  console.log(`[shipping] ${prefix} - method=${req.method} url=${req.originalUrl} query=${JSON.stringify(req.query)} params=${JSON.stringify(req.params)}`);
  if (req.body) console.log(`[shipping] ${prefix} body=${JSON.stringify(req.body)}`);
};

// Simple DB connectivity check
exports.ping = async (req, res) => {
  try {
    logReq('ping', req);
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ success: true, db: rows[0] });
  } catch (err) {
    console.error('[shipping] ping error', err.sqlMessage || err.message || err);
    res.status(500).json({ success: false, message: 'DB ping failed', error: err.sqlMessage || err.message });
  }
};

// Get all addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    logReq('getAddresses', req);
    const userId = req.query.user_id;
    if (!userId) {
      console.warn('[shipping] getAddresses missing user_id');
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    const sql = 'SELECT * FROM shipping_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC';
    console.log('[shipping] getAddresses sql=', sql, 'params=', [userId]);
    const [rows] = await db.query(sql, [userId]);
    res.json({ success: true, addresses: rows });
  } catch (err) {
    console.error('[shipping] getAddresses error', err.sqlMessage || err.message || err);
    res.status(500).json({ success: false, message: 'Server error', error: err.sqlMessage || err.message });
  }
};

// Create a new address
exports.createAddress = async (req, res) => {
  try {
    logReq('createAddress', req);
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      street_address,
      city,
      state,
      zip_code,
      country,
      is_default
    } = req.body;

    if (!user_id || !first_name || !last_name || !street_address || !city || !state || !zip_code || !country || !phone) {
      console.warn('[shipping] createAddress missing fields', req.body);
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // if this address is default, unset other defaults for the user
    if (is_default) {
      const uSql = 'UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?';
      console.log('[shipping] unset defaults sql=', uSql, 'params=', [user_id]);
      await db.query(uSql, [user_id]);
    }

    const insertSql = `INSERT INTO shipping_addresses (user_id, first_name, last_name, email, phone, street_address, city, state, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [user_id, first_name, last_name, email || '', phone, street_address, city, state, zip_code, country, is_default ? 1 : 0];
    console.log('[shipping] insert sql=', insertSql, 'params=', params);
    const [result] = await db.query(insertSql, params);

    const [rows] = await db.query('SELECT * FROM shipping_addresses WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, address: rows[0] });
  } catch (err) {
    console.error('[shipping] createAddress error', err.sqlMessage || err.message || err);
    res.status(500).json({ success: false, message: 'Server error', error: err.sqlMessage || err.message });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    logReq('updateAddress', req);
    const id = req.params.id;
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      street_address,
      city,
      state,
      zip_code,
      country,
      is_default
    } = req.body;

    if (!id) {
      console.warn('[shipping] updateAddress missing id');
      return res.status(400).json({ success: false, message: 'Address id required' });
    }

    if (is_default) {
      const unsetSql = 'UPDATE shipping_addresses SET is_default = 0 WHERE user_id = ?';
      console.log('[shipping] unset defaults sql=', unsetSql, 'params=', [user_id]);
      await db.query(unsetSql, [user_id]);
    }

    const updateSql = `UPDATE shipping_addresses SET first_name=?, last_name=?, email=?, phone=?, street_address=?, city=?, state=?, zip_code=?, country=?, is_default=? WHERE id = ?`;
    const updParams = [first_name, last_name, email || '', phone, street_address, city, state, zip_code, country, is_default ? 1 : 0, id];
    console.log('[shipping] update sql=', updateSql, 'params=', updParams);
    await db.query(updateSql, updParams);

    const [rows] = await db.query('SELECT * FROM shipping_addresses WHERE id = ?', [id]);
    res.json({ success: true, address: rows[0] });
  } catch (err) {
    console.error('[shipping] updateAddress error', err.sqlMessage || err.message || err);
    res.status(500).json({ success: false, message: 'Server error', error: err.sqlMessage || err.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    logReq('deleteAddress', req);
    const id = req.params.id;
    if (!id) {
      console.warn('[shipping] deleteAddress missing id');
      return res.status(400).json({ success: false, message: 'Address id required' });
    }

    const delSql = 'DELETE FROM shipping_addresses WHERE id = ?';
    console.log('[shipping] delete sql=', delSql, 'params=', [id]);
    await db.query(delSql, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[shipping] deleteAddress error', err.sqlMessage || err.message || err);
    res.status(500).json({ success: false, message: 'Server error', error: err.sqlMessage || err.message });
  }
};
