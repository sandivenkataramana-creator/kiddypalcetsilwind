const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const uploadDir = path.join(__dirname, '..', 'uploads', 'products');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function migrateProductsImages() {
  console.log('🔄 Migrating products.image → image_url ...');

  const [rows] = await db.query(
    'SELECT id, image, image_type FROM products WHERE image IS NOT NULL AND image_url IS NULL'
  );

  for (const row of rows) {
    const ext = row.image_type?.split('/')[1] || 'jpg';
    const filename = `product-${row.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, row.image);

    const imageUrl = `/uploads/products/${filename}`;

    await db.query(
      'UPDATE products SET image_url = ? WHERE id = ?',
      [imageUrl, row.id]
    );

    console.log(`✅ Product ${row.id} migrated`);
  }

  console.log('✅ Products images migration done.');
}

async function migrateProductImagesTable() {
  console.log('🔄 Migrating product_images.image → image_url ...');

  const [rows] = await db.query(
    'SELECT id, product_id, image, image_type FROM product_images WHERE image IS NOT NULL AND image_url IS NULL'
  );

  for (const row of rows) {
    const ext = row.image_type?.split('/')[1] || 'jpg';
    const filename = `product-${row.product_id}-extra-${row.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, row.image);

    const imageUrl = `/uploads/products/${filename}`;

    await db.query(
      'UPDATE product_images SET image_url = ? WHERE id = ?',
      [imageUrl, row.id]
    );

    console.log(`✅ Extra image ${row.id} migrated`);
  }

  console.log('✅ product_images migration done.');
}

async function run() {
  try {
    await migrateProductsImages();
    await migrateProductImagesTable();
    console.log('🎉 All migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
