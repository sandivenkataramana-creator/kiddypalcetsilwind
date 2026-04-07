/**
 * Script to fix product image sort_order
 * This script reorganizes product images so the actual product image comes first
 * Usage: node scripts/fixImageOrder.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixImageOrder() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database');

    // Get all products with their images
    const [products] = await connection.query('SELECT id FROM products');
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;
    let processed = 0;

    for (const product of products) {
      processed++;
      const [images] = await connection.query(
        `SELECT id, image_url, sort_order 
         FROM product_images 
         WHERE product_id = ? 
         ORDER BY sort_order ASC`,
        [product.id]
      );

      if (images.length === 0) continue;

      console.log(`\n📸 Product ${product.id}: ${images.length} images`);
      images.forEach((img, idx) => {
        console.log(`  [${idx}] ${img.image_url} (current sort_order: ${img.sort_order})`);
      });

      // Reset sort_order to 0, 1, 2, ... based on current order
      const updateQueries = images.map((img, newOrder) =>
        connection.query(
          'UPDATE product_images SET sort_order = ? WHERE id = ?',
          [newOrder, img.id]
        )
      );

      await Promise.all(updateQueries);
      updated += images.length;
      console.log(`  ✅ Reordered`);
    }

    console.log(`\n\n✅ SUCCESS: Fixed ${updated} images across ${processed} products`);
    console.log('Images are now ordered: 0 (first/primary), 1, 2, 3, ...');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

fixImageOrder();
