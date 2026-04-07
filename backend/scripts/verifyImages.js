/**
 * COMPREHENSIVE IMAGE VERIFICATION SCRIPT
 * - Verify all products display images correctly
 * - Generate a detailed report of the image system health
 * - Suggest fixes if any issues found
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function comprehensiveImageVerification() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
    console.log('║  COMPREHENSIVE PRODUCT IMAGE VERIFICATION REPORT                   ║');
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    let hasIssues = false;

    // ============ 1. IMAGE CONSISTENCY CHECK ============
    console.log('📋 1. IMAGE CONSISTENCY CHECK\n');

    const [consistencyIssues] = await connection.query(`
      SELECT COUNT(*) as count FROM products p
      WHERE (p.image_url IS NULL AND p.id IN (SELECT DISTINCT product_id FROM product_images))
      OR (p.image_url IS NOT NULL AND p.id NOT IN (SELECT DISTINCT product_id FROM product_images))
      OR (p.image_url NOT IN (SELECT image_url FROM product_images WHERE product_id = p.id))
    `);

    if (consistencyIssues[0].count === 0) {
      console.log('✅ All products have consistent images between products.image_url');
      console.log('   and product_images table\n');
    } else {
      console.log(`❌ Found ${consistencyIssues[0].count} inconsistencies\n`);
      hasIssues = true;
    }

    // ============ 2. IMAGE COVERAGE ============
    console.log('📋 2. IMAGE COVERAGE\n');

    const [[totalProducts]] = await connection.query('SELECT COUNT(*) as cnt FROM products');
    const [[productsWithImages]] = await connection.query(
      'SELECT COUNT(DISTINCT p.id) as cnt FROM products p WHERE p.image_url IS NOT NULL'
    );
    const [[totalImages]] = await connection.query('SELECT COUNT(*) as cnt FROM product_images');

    const coverage = ((productsWithImages.cnt / totalProducts.cnt) * 100).toFixed(1);
    console.log(`   Total Products: ${totalProducts.cnt}`);
    console.log(`   Products with images: ${productsWithImages.cnt}`);
    console.log(`   Image coverage: ${coverage}%`);
    console.log(`   Total image entries: ${totalImages.cnt}\n`);

    if (productsWithImages.cnt === totalProducts.cnt) {
      console.log('✅ All products have at least one image\n');
    } else {
      console.log(`⚠️  ${totalProducts.cnt - productsWithImages.cnt} products have no images\n`);
      hasIssues = true;
    }

    // ============ 3. MULTIPLE IMAGES DISTRIBUTION ============
    console.log('📋 3. MULTIPLE IMAGES DISTRIBUTION\n');

    const [imageDistribution] = await connection.query(`
      SELECT 
        SUM(CASE WHEN image_count = 1 THEN 1 ELSE 0 END) as single_image,
        SUM(CASE WHEN image_count > 1 AND image_count <= 3 THEN 1 ELSE 0 END) as two_to_three,
        SUM(CASE WHEN image_count > 3 AND image_count <= 5 THEN 1 ELSE 0 END) as four_to_five,
        SUM(CASE WHEN image_count > 5 THEN 1 ELSE 0 END) as more_than_five
      FROM (
        SELECT COUNT(id) as image_count FROM product_images GROUP BY product_id
      ) img_counts
    `);

    const dist = imageDistribution[0];
    console.log(`   Products with 1 image: ${dist.single_image || 0}`);
    console.log(`   Products with 2-3 images: ${dist.two_to_three || 0}`);
    console.log(`   Products with 4-5 images: ${dist.four_to_five || 0}`);
    console.log(`   Products with 5+ images: ${dist.more_than_five || 0}\n`);

    const multiImageCount = (dist.two_to_three || 0) + (dist.four_to_five || 0) + (dist.more_than_five || 0);
    const multiImagePercentage = ((multiImageCount / productsWithImages.cnt) * 100).toFixed(1);

    console.log(`   Products with multiple images (2+): ${multiImageCount} (${multiImagePercentage}%)\n`);

    if (multiImageCount < productsWithImages.cnt * 0.5) {
      console.log('⚠️  Less than 50% of products have multiple images\n');
      console.log('💡 Recommendation: Encourage uploading multiple images for products\n');
      hasIssues = true;
    } else {
      console.log('✅ Good coverage of products with multiple images\n');
    }

    // ============ 4. DATA INTEGRITY CHECK ============
    console.log('📋 4. DATA INTEGRITY CHECK\n');

    const [orphanedImages] = await connection.query(`
      SELECT COUNT(*) as cnt FROM product_images pi
      WHERE pi.product_id NOT IN (SELECT id FROM products)
    `);

    if (orphanedImages[0].cnt === 0) {
      console.log('✅ No orphaned images found\n');
    } else {
      console.log(`❌ Found ${orphanedImages[0].cnt} orphaned images\n`);
      hasIssues = true;
    }

    // ============ 5. SAMPLE PRODUCTS WITH IMAGES ============
    console.log('📋 5. SAMPLE PRODUCTS (showing image structure)\n');

    const [sampleProducts] = await connection.query(`
      SELECT p.id, p.name, p.image_url, 
             (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as image_count
      FROM products p
      WHERE p.image_url IS NOT NULL
      ORDER BY p.id
      LIMIT 5
    `);

    sampleProducts.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ID: ${p.id}, Name: "${p.name}"`);
      console.log(`      Images: ${p.image_count}, Primary: ${p.image_url}`);
    });
    console.log('\n');

    // ============ 6. DETAILED ISSUE REPORT ============
    if (hasIssues) {
      console.log('🚨 ISSUES FOUND - RECOMMENDED ACTIONS:\n');

      const [problemProducts] = await connection.query(`
        SELECT p.id, p.name, p.image_url,
               (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) as img_count
        FROM products p
        WHERE (p.image_url IS NULL AND p.id IN (SELECT DISTINCT product_id FROM product_images))
        OR (p.image_url IS NOT NULL AND p.id NOT IN (SELECT DISTINCT product_id FROM product_images))
        OR (p.image_url NOT IN (SELECT image_url FROM product_images WHERE product_id = p.id))
        LIMIT 10
      `);

      if (problemProducts.length > 0) {
        console.log('⚠️  Problem Products:\n');
        problemProducts.forEach((p) => {
          console.log(`   - ID: ${p.id}, Name: "${p.name}"`);
          console.log(`     Primary image_url: ${p.image_url}`);
          console.log(`     Images in product_images: ${p.img_count}`);
        });
        console.log('\n   Action: Run "node scripts/fixImageIssues.js" to fix\n');
      }
    }

    // ============ 7. FINAL SUMMARY ============
    console.log('╔═══════════════════════════════════════════════════════════════════╗');
    if (!hasIssues) {
      console.log('║  ✅ ALL CHECKS PASSED - IMAGE SYSTEM IS HEALTHY                    ║');
    } else {
      console.log('║  ⚠️  SOME ISSUES FOUND - RUN FIX SCRIPT TO RESOLVE                ║');
    }
    console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

    await connection.end();
  } catch (error) {
    console.error('Verification error:', error);
    process.exit(1);
  }
}

comprehensiveImageVerification();
