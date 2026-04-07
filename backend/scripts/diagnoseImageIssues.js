/**
 * DIAGNOSTIC SCRIPT: Identify all product image issues
 * - Products without any images
 * - Products with images in product_images but not in products.image_url
 * - Products with different images in list vs details
 * - Orphaned images
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function diagnoseImageIssues() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('\n🔍 PRODUCT IMAGE DIAGNOSTIC REPORT\n');
    console.log('=' .repeat(70));

    // ============ 1. PRODUCTS WITH NO IMAGES ============
    console.log('\n📌 1. PRODUCTS WITH NO IMAGES AT ALL:\n');
    const [noImages] = await connection.query(`
      SELECT p.id, p.name, p.price 
      FROM products p
      WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_images)
      AND p.id NOT IN (SELECT id FROM products WHERE image_url IS NOT NULL)
      ORDER BY p.id
    `);

    if (noImages.length > 0) {
      console.log(`❌ Found ${noImages.length} products with NO images:\n`);
      noImages.forEach((p) => {
        console.log(`   - ID: ${p.id}, Name: "${p.name}", Price: $${p.price}`);
      });
    } else {
      console.log('✅ All products have at least one image source');
    }

    // ============ 2. PRODUCTS WITH IMAGES IN product_images BUT NOT IN products.image_url ============
    console.log('\n📌 2. PRODUCTS WITH IMAGES IN product_images BUT NOT IN products.image_url:\n');
    const [missingPrimary] = await connection.query(`
      SELECT DISTINCT p.id, p.name, COUNT(pi.id) as image_count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      WHERE p.image_url IS NULL
      GROUP BY p.id, p.name
      ORDER BY p.id
    `);

    if (missingPrimary.length > 0) {
      console.log(`⚠️  Found ${missingPrimary.length} products missing primary image_url:\n`);
      missingPrimary.forEach((p) => {
        console.log(`   - ID: ${p.id}, Name: "${p.name}", Images in DB: ${p.image_count}`);
      });
    } else {
      console.log('✅ All products with product_images have primary image_url set');
    }

    // ============ 3. PRODUCTS WHERE products.image_url IS DIFFERENT FROM FIRST product_images ============
    console.log('\n📌 3. PRODUCTS WITH INCONSISTENT PRIMARY IMAGE:\n');
    const [inconsistentImages] = await connection.query(`
      SELECT p.id, p.name, p.image_url as primary_in_products, pi.image_url as first_in_product_images
      FROM products p
      INNER JOIN (
        SELECT product_id, image_url, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY sort_order ASC) as rn
        FROM product_images
      ) pi ON p.id = pi.product_id AND pi.rn = 1
      WHERE p.image_url != pi.image_url AND p.image_url IS NOT NULL
      ORDER BY p.id
    `);

    if (inconsistentImages.length > 0) {
      console.log(`⚠️  Found ${inconsistentImages.length} products with inconsistent primary images:\n`);
      inconsistentImages.forEach((p) => {
        console.log(`   - ID: ${p.id}, Name: "${p.name}"`);
        console.log(`     Products table: ${p.primary_in_products}`);
        console.log(`     Product_images (first): ${p.first_in_product_images}\n`);
      });
    } else {
      console.log('✅ All primary images are consistent between tables');
    }

    // ============ 4. STATISTICS ============
    console.log('\n📌 4. OVERALL IMAGE STATISTICS:\n');
    const [[totalProducts]] = await connection.query('SELECT COUNT(*) as cnt FROM products');
    const [[totalImages]] = await connection.query('SELECT COUNT(*) as cnt FROM product_images');
    const [[productsWithAnyImage]] = await connection.query(`
      SELECT COUNT(DISTINCT p.id) as cnt 
      FROM products p
      WHERE p.image_url IS NOT NULL OR p.id IN (SELECT DISTINCT product_id FROM product_images)
    `);

    console.log(`   Total Products: ${totalProducts.cnt}`);
    console.log(`   Products with images: ${productsWithAnyImage.cnt}`);
    console.log(`   Products without images: ${totalProducts.cnt - productsWithAnyImage.cnt}`);
    console.log(`   Total image entries: ${totalImages.cnt}`);
    console.log(`   Average images per product: ${(totalImages.cnt / productsWithAnyImage.cnt).toFixed(2)}`);

    // ============ 5. ORPHANED IMAGES ============
    console.log('\n📌 5. ORPHANED IMAGES (Images without products):\n');
    const [orphaned] = await connection.query(`
      SELECT pi.id, pi.image_url, pi.product_id
      FROM product_images pi
      LEFT JOIN products p ON pi.product_id = p.id
      WHERE p.id IS NULL
    `);

    if (orphaned.length > 0) {
      console.log(`❌ Found ${orphaned.length} orphaned images:\n`);
      orphaned.forEach((img) => {
        console.log(`   - Image ID: ${img.id}, Product ID: ${img.product_id}, URL: ${img.image_url}`);
      });
    } else {
      console.log('✅ No orphaned images found');
    }

    // ============ 6. PRODUCTS WITH MULTIPLE IMAGES - SAMPLE ============
    console.log('\n📌 6. PRODUCTS WITH MULTIPLE IMAGES (Sample):\n');
    const [multiImage] = await connection.query(`
      SELECT p.id, p.name, COUNT(pi.id) as image_count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id, p.name
      HAVING COUNT(pi.id) > 1
      ORDER BY image_count DESC
      LIMIT 10
    `);

    if (multiImage.length > 0) {
      console.log(`✅ Found ${multiImage.length} products with multiple images (showing first 10):\n`);
      multiImage.forEach((p) => {
        console.log(`   - ID: ${p.id}, Name: "${p.name}", Images: ${p.image_count}`);
      });
    } else {
      console.log('ℹ️  No products with multiple images found');
    }

    // ============ 7. PRODUCTS WITH SINGLE IMAGE IN product_images ============
    console.log('\n📌 7. PRODUCTS WITH ONLY ONE IMAGE:\n');
    const [singleImage] = await connection.query(`
      SELECT p.id, p.name, COUNT(pi.id) as image_count
      FROM products p
      INNER JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id, p.name
      HAVING COUNT(pi.id) = 1
      ORDER BY p.id
      LIMIT 5
    `);

    console.log(`ℹ️  Sample of products with single image (showing first 5):\n`);
    if (singleImage.length > 0) {
      singleImage.forEach((p) => {
        console.log(`   - ID: ${p.id}, Name: "${p.name}"`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ DIAGNOSTIC COMPLETE\n');

    await connection.end();
  } catch (error) {
    console.error('Diagnostic error:', error);
    process.exit(1);
  }
}

diagnoseImageIssues();
