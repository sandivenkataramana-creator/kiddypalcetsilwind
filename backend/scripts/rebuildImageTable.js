/**
 * Script to rebuild product_images table from actual files on disk
 * This ensures database matches actual uploaded images
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function rebuildImageTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connected to database\n');

    const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
    
    // Read all image files from disk
    const files = fs.readdirSync(uploadsDir).filter(f => 
      f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png')
    );

    console.log(`📂 Found ${files.length} image files on disk\n`);

    // Group files by product ID (extract from filename like "product-94-xxx.jpeg")
    const filesByProduct = {};
    const fileToPath = {};

    files.forEach(file => {
      const match = file.match(/^product-(\d+)/);
      if (match) {
        const productId = parseInt(match[1]);
        if (!filesByProduct[productId]) {
          filesByProduct[productId] = [];
        }
        filesByProduct[productId].push(file);
        fileToPath[file] = `/uploads/products/${file}`;
      }
    });

    console.log(`🔍 Found images for ${Object.keys(filesByProduct).length} products\n`);

    // Clear existing product_images that don't have files
    const [allImages] = await connection.query(
      'SELECT id, image_url FROM product_images'
    );

    let deletedCount = 0;
    for (const img of allImages) {
      const filename = img.image_url.replace('/uploads/products/', '');
      const filepath = path.join(uploadsDir, filename);
      if (!fs.existsSync(filepath)) {
        await connection.query('DELETE FROM product_images WHERE id = ?', [img.id]);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️  Deleted ${deletedCount} entries for missing files\n`);
    }

    // Rebuild product_images from actual files
    let addedCount = 0;
    let productCount = 0;

    for (const [productId, productFiles] of Object.entries(filesByProduct)) {
      productCount++;
      
      // Sort files to ensure consistent order
      productFiles.sort();

      // Check if product exists
      const [product] = await connection.query(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );

      if (!product.length) {
        console.log(`⚠️  Skipping: Product ${productId} does not exist in database`);
        continue;
      }

      // Delete existing images for this product
      await connection.query(
        'DELETE FROM product_images WHERE product_id = ?',
        [productId]
      );

      // Add images from files
      for (let i = 0; i < productFiles.length; i++) {
        const file = productFiles[i];
        const imageUrl = fileToPath[file];

        await connection.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [productId, imageUrl, i]
        );
        addedCount++;
      }

      if (productCount % 10 === 0) {
        console.log(`  Processed ${productCount} products...`);
      }
    }

    console.log(`\n` + '='.repeat(60));
    console.log('✅ REBUILD COMPLETE');
    console.log('='.repeat(60));
    console.log(`Products with images: ${productCount}`);
    console.log(`Total image entries created: ${addedCount}`);
    console.log(`Deleted broken entries: ${deletedCount}`);
    console.log(`\nDatabase now matches files on disk!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

rebuildImageTable();
