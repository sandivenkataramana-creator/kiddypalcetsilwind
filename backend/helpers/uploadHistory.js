const db = require('../config/db');
const path = require('path');

/**
 * Save bulk upload record to database
 * Uses existing bulk_uploads table structure
 */
exports.saveBulkUploadRecord = async (uploadData) => {
  try {
    const {
      uploaded_by = null,
      total_rows = 0,
      accepted_count = 0,
      rejected_count = 0
    } = uploadData;

    const query = `
      INSERT INTO bulk_uploads (
        uploaded_by,
        total_rows,
        accepted_rows,
        rejected_rows
      ) VALUES (?, ?, ?, ?)
    `;

    const values = [
      uploaded_by,
      total_rows,
      accepted_count,
      rejected_count
    ];

    console.log('📊 Saving to bulk_uploads with values:', values);
    const [result] = await db.query(query, values);
    console.log('✅ Saved with upload_id:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('⚠️ Error saving bulk upload record:', error.message);
    throw error;
  }
};

// Ensure the `bulk_uploads` table exists with the expected minimal schema.
const ensureBulkUploadsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bulk_uploads (
        upload_id INT PRIMARY KEY AUTO_INCREMENT,
        uploaded_by INT NULL,
        total_rows INT DEFAULT 0,
        accepted_rows INT DEFAULT 0,
        rejected_rows INT DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Ensured bulk_uploads table exists');
  } catch (err) {
    console.error('⚠️ Could not ensure bulk_uploads table:', err.message);
  }
};

// Run table creation in background (best-effort)
ensureBulkUploadsTable();

/**
 * Get all upload history
 */
exports.getUploadHistory = async (limit = 50, offset = 0) => {
  try {
    const query = `
      SELECT 
        upload_id,
        uploaded_by,
        total_rows,
        accepted_rows,
        rejected_rows,
        uploaded_at
      FROM bulk_uploads
      ORDER BY uploaded_at DESC
      LIMIT ? OFFSET ?
    `;

    console.log('📖 Fetching upload history with limit:', limit, 'offset:', offset);
    const [records] = await db.query(query, [limit, offset]);
    console.log('📖 Fetched records:', records.length);
    return records;
  } catch (error) {
    console.error('❌ Error getting upload history:', error.message);
    throw error;
  }
};

/**
 * Get upload record by ID
 */
exports.getUploadRecordById = async (uploadId) => {
  try {
    const query = `
      SELECT *
      FROM bulk_uploads
      WHERE upload_id = ?
    `;

    const [[record]] = await db.query(query, [uploadId]);
    return record;
  } catch (error) {
    console.error('❌ Error getting upload record:', error.message);
    throw error;
  }
};

/**
 * Delete upload record
 */
exports.deleteUploadRecord = async (uploadId) => {
  try {
    const query = `
      DELETE FROM bulk_uploads
      WHERE upload_id = ?
    `;

    const [result] = await db.query(query, [uploadId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('❌ Error deleting upload record:', error.message);
    throw error;
  }
};

/**
 * Get total count of uploads
 */
exports.getUploadCount = async () => {
  try {
    const query = `SELECT COUNT(*) as count FROM bulk_uploads`;
    const [[result]] = await db.query(query);
    return result.count;
  } catch (error) {
    console.error('❌ Error getting upload count:', error.message);
    throw error;
  }
};
