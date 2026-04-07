/**
 * BULK ENABLE MULTIPLE IMAGES
 * This script helps you identify products that need multiple images
 * and provides guidance on how to add more images
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function bulkImageAnalysis() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  PRODUCTS NEEDING MULTIPLE IMAGES                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    // Get products with only 1 image
    const [singleImageProducts] = await connection.query(`
      SELECT p.id, p.name, p.price, p.category_id,
             (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
      FROM products p
      WHERE p.id IN (
        SELECT product_id FROM product_images 
        GROUP BY product_id 
        HAVING COUNT(*) = 1
      )
      ORDER BY p.id
    `);

    console.log(`Found ${singleImageProducts.length} products with only 1 image:\n`);

    // Group by category for easier management
    const byCategory = {};
    singleImageProducts.forEach(p => {
      const cat = p.category_id || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p);
    });

    let displayCount = 0;
    Object.entries(byCategory).forEach(([category, products]) => {
      console.log(`📁 Category ${category || 'Uncategorized'}: ${products.length} products\n`);
      products.slice(0, 5).forEach(p => {
        console.log(`   ${++displayCount}. ID: ${p.id} | "${p.name}" | Price: $${p.price}`);
      });
      if (products.length > 5) {
        console.log(`   ... and ${products.length - 5} more in this category\n`);
      } else {
        console.log('');
      }
    });

    console.log('═'.repeat(70));
    console.log('\n💡 HOW TO ADD MULTIPLE IMAGES TO THESE PRODUCTS:\n');
    console.log('1. Go to Admin Panel > Products');
    console.log('2. Click "Edit" on the product you want to update');
    console.log('3. Scroll down to "Upload Images" section');
    console.log('4. Click the "+" button next to images');
    console.log('5. Select 2-5 additional images and upload');
    console.log('6. Refresh the page to see all images\n');

    console.log('═'.repeat(70));
    console.log('\n📊 STATS:\n');
    console.log(`   Products with only 1 image: ${singleImageProducts.length}`);
    console.log(`   Products with multiple images: ${108 - singleImageProducts.length}`);
    console.log(`   Percentage with multiple images: ${(((108 - singleImageProducts.length) / 108) * 100).toFixed(1)}%\n`);

    console.log('═'.repeat(70));
    console.log('\n✅ NEXT STEPS:\n');
    console.log('1. For better product presentation, upload 2-5 images per product');
    console.log('2. Include: front view, side view, detail view, comparison (if applicable)');
    console.log('3. Use consistent lighting and backgrounds for professional look');
    console.log('4. Run "node scripts/verifyImages.js" after bulk uploads to verify\n');

    await connection.end();
  } catch (error) {
    console.error('Analysis error:', error);
    process.exit(1);
  }
}

bulkImageAnalysis();
