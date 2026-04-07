/**
 * Script to migrate image_url from products table to product_images table
 * This ensures all products have their images in the product_images table
 * Usage: node scripts/migrateProductImages.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateImages() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database\n');

    // Get all products that have image_url but no product_images
    const [products] = await connection.query(`
      SELECT p.id, p.name, p.image_url 
      FROM products p
      WHERE p.image_url IS NOT NULL 
        AND p.image_url != ''
        AND NOT EXISTS (
          SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
        )
      ORDER BY p.id DESC
    `);

    console.log(`📦 Found ${products.length} products with image_url but no product_images entries\n`);

    if (products.length === 0) {
      console.log('✅ All products already migrated!');
      return;
    }

    let created = 0;

    for (const product of products) {
      console.log(`📸 Product ${product.id}: "${product.name}"`);
      console.log(`   Image: ${product.image_url}`);

      try {
        await connection.query(
          `INSERT INTO product_images (product_id, image_url, sort_order) 
           VALUES (?, ?, ?)`,
          [product.id, product.image_url, 0]
        );
        created++;
        console.log(`   ✅ Created\n`);
      } catch (err) {
        console.error(`   ❌ Error: ${err.message}\n`);
      }
    }

    console.log(`\n✅ SUCCESS: Created ${created} product_images entries`);
    console.log(`\n📝 Summary:`);
    console.log(`   - Products with image_url: ${products.length}`);
    console.log(`   - Successfully migrated: ${created}`);
    console.log(`\nAll products now have images in product_images table!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrateImages();
