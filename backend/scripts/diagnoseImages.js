/**
 * Script to diagnose and fix product image issues
 * 1. Checks for duplicate images
 * 2. Verifies image files exist
 * 3. Fixes sort_order conflicts
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function diagnoseImages() {
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
    console.log(`📂 Checking uploads directory: ${uploadsDir}\n`);

    // Get all products with all their images
    const [products] = await connection.query(`
      SELECT 
        p.id, 
        p.name,
        COUNT(pi.id) as image_count,
        GROUP_CONCAT(pi.image_url SEPARATOR '||') as all_images,
        GROUP_CONCAT(pi.id SEPARATOR '||') as image_ids,
        GROUP_CONCAT(pi.sort_order SEPARATOR '||') as sort_orders
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id, p.name
      ORDER BY p.id DESC
    `);

    console.log(`🔍 Analyzing ${products.length} products...\n`);

    let duplicates = 0;
    let missingFiles = 0;
    let fixedCount = 0;
    let issues = [];

    for (const product of products) {
      if (!product.all_images) continue;

      const imageUrls = product.all_images.split('||');
      const imageIds = product.image_ids.split('||');
      const sortOrders = product.sort_orders.split('||');

      // Check for duplicate images in same product
      const uniqueImages = new Set(imageUrls);
      if (uniqueImages.size < imageUrls.length) {
        duplicates++;
        console.log(`⚠️  Product ${product.id}: "${product.name}"`);
        console.log(`   Has ${imageUrls.length} entries but only ${uniqueImages.size} unique images`);
        
        // Remove duplicates - keep first, remove rest
        for (let i = 1; i < imageUrls.length; i++) {
          if (imageUrls[i] === imageUrls[0]) {
            console.log(`   Deleting duplicate: ${imageIds[i]}`);
            await connection.query(
              'DELETE FROM product_images WHERE id = ?',
              [imageIds[i]]
            );
            fixedCount++;
          }
        }
        console.log();
      }

      // Check if image files exist
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const filename = imageUrl.replace('/uploads/products/', '');
        const filepath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filepath)) {
          missingFiles++;
          console.log(`❌ Product ${product.id}: Missing file`);
          console.log(`   URL: ${imageUrl}`);
          console.log(`   Expected at: ${filepath}`);
          console.log(`   Deleting from database...\n`);
          
          // Delete from database since file doesn't exist
          await connection.query(
            'DELETE FROM product_images WHERE id = ?',
            [imageIds[i]]
          );
          fixedCount++;
          issues.push({
            product_id: product.id,
            product_name: product.name,
            issue: 'Missing file',
            image_url: imageUrl
          });
        }
      }
    }

    // Now fix sort_order for all remaining products
    console.log('\n🔧 Fixing sort_order for all products...\n');

    const [allProducts] = await connection.query('SELECT DISTINCT product_id FROM product_images ORDER BY product_id DESC');
    
    let sortOrderFixed = 0;
    for (const prod of allProducts) {
      const [images] = await connection.query(
        `SELECT id FROM product_images WHERE product_id = ? ORDER BY id ASC`,
        [prod.product_id]
      );

      for (let i = 0; i < images.length; i++) {
        await connection.query(
          'UPDATE product_images SET sort_order = ? WHERE id = ?',
          [i, images[i].id]
        );
        sortOrderFixed++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSTIC REPORT');
    console.log('='.repeat(60));
    console.log(`Products with duplicate images: ${duplicates}`);
    console.log(`Missing image files found: ${missingFiles}`);
    console.log(`Total items fixed: ${fixedCount}`);
    console.log(`Sort orders corrected: ${sortOrderFixed}`);

    if (issues.length > 0) {
      console.log('\n⚠️  Issues Found:');
      issues.forEach(issue => {
        console.log(`   - Product ${issue.product_id}: ${issue.product_name}`);
        console.log(`     Issue: ${issue.issue}`);
      });
    } else {
      console.log('\n✅ No critical issues found!');
    }

    console.log('\n✅ Diagnostic complete. Database cleaned up.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

diagnoseImages();
