/**
 * FIX SCRIPT: Synchronize and fix product images
 * - Ensure all products have primary image_url in products table
 * - Sync primary image with first image in product_images
 * - Create missing primary images
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixImageIssues() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('\n🔧 PRODUCT IMAGE FIX SCRIPT\n');
    console.log('='.repeat(70));

    // ============ STEP 1: Fix products missing primary image_url ============
    console.log('\n📌 STEP 1: Fixing products missing primary image_url\n');
    
    const [missingPrimary] = await connection.query(`
      SELECT DISTINCT p.id, p.name, pi.image_url
      FROM products p
      INNER JOIN (
        SELECT product_id, image_url, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY sort_order ASC) as rn
        FROM product_images
      ) pi ON p.id = pi.product_id AND pi.rn = 1
      WHERE p.image_url IS NULL
    `);

    if (missingPrimary.length > 0) {
      console.log(`Found ${missingPrimary.length} products to fix:\n`);
      for (const product of missingPrimary) {
        console.log(`   Updating ID: ${product.id}, Name: "${product.name}"`);
        console.log(`   Setting image_url: ${product.image_url}`);
        
        await connection.query(
          'UPDATE products SET image_url = ? WHERE id = ?',
          [product.image_url, product.id]
        );
      }
      console.log(`✅ Fixed ${missingPrimary.length} products\n`);
    } else {
      console.log('✅ No products with missing primary image_url\n');
    }

    // ============ STEP 2: Sync inconsistent primary images ============
    console.log('\n📌 STEP 2: Fixing inconsistent primary images\n');
    
    const [inconsistent] = await connection.query(`
      SELECT p.id, p.name, p.image_url as old_image, pi.image_url as new_image
      FROM products p
      INNER JOIN (
        SELECT product_id, image_url, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY sort_order ASC) as rn
        FROM product_images
      ) pi ON p.id = pi.product_id AND pi.rn = 1
      WHERE p.image_url != pi.image_url AND p.image_url IS NOT NULL
    `);

    if (inconsistent.length > 0) {
      console.log(`Found ${inconsistent.length} products with inconsistent images:\n`);
      for (const product of inconsistent) {
        console.log(`   Updating ID: ${product.id}, Name: "${product.name}"`);
        console.log(`   Old image: ${product.old_image}`);
        console.log(`   New image: ${product.new_image}`);
        
        await connection.query(
          'UPDATE products SET image_url = ? WHERE id = ?',
          [product.new_image, product.id]
        );
      }
      console.log(`✅ Fixed ${inconsistent.length} products\n`);
    } else {
      console.log('✅ No inconsistent primary images\n');
    }

    // ============ STEP 3: Verify all products have primary image_url ============
    console.log('\n📌 STEP 3: Verification\n');
    
    const [[totalProducts]] = await connection.query('SELECT COUNT(*) as cnt FROM products');
    const [[productsWithPrimary]] = await connection.query(
      'SELECT COUNT(*) as cnt FROM products WHERE image_url IS NOT NULL'
    );
    const [[totalImages]] = await connection.query('SELECT COUNT(*) as cnt FROM product_images');

    console.log(`   Total Products: ${totalProducts.cnt}`);
    console.log(`   Products with primary image: ${productsWithPrimary.cnt}`);
    console.log(`   Total image entries: ${totalImages.cnt}`);

    if (totalProducts.cnt === productsWithPrimary.cnt) {
      console.log('\n✅ All products now have a primary image_url!\n');
    } else {
      console.log(`\n⚠️  Still ${totalProducts.cnt - productsWithPrimary.cnt} products without images\n`);
    }

    // ============ STEP 4: Report products without images in product_images ============
    console.log('\n📌 STEP 4: Products with no images in product_images table\n');
    
    const [withoutProductImages] = await connection.query(`
      SELECT p.id, p.name, p.image_url
      FROM products p
      WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_images)
      ORDER BY p.id
    `);

    if (withoutProductImages.length > 0) {
      console.log(`Found ${withoutProductImages.length} products with only legacy images:\n`);
      console.log('These products have images in products.image_url but NOT in product_images table');
      console.log('Consider uploading fresh images for these products.\n');
      withoutProductImages.slice(0, 10).forEach((p) => {
        console.log(`   - ID: ${p.id}, Name: "${p.name}", Image: ${p.image_url}`);
      });
      if (withoutProductImages.length > 10) {
        console.log(`   ... and ${withoutProductImages.length - 10} more`);
      }
    } else {
      console.log('✅ All products have images in product_images table');
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ FIX SCRIPT COMPLETE\n');

    await connection.end();
  } catch (error) {
    console.error('Fix script error:', error);
    process.exit(1);
  }
}

fixImageIssues();
