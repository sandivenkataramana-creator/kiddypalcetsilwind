const db = require('./config/db');

async function testGetProducts() {
  try {
    // Test 1: Get count
    console.log('Test 1: Getting product count...');
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM products');
    console.log(`Total products in database: ${count}`);

    // Test 2: Get first 5 products
    console.log('\nTest 2: Getting first 5 products...');
    const [products5] = await db.query('SELECT id, name, product_code FROM products LIMIT 5');
    console.log(`First 5 products:`, products5);

    // Test 3: Get all products
    console.log('\nTest 3: Getting ALL products...');
    const [allProducts] = await db.query('SELECT id, name, product_code FROM products');
    console.log(`Total fetched: ${allProducts.length}`);
    console.log(`First 3:`, allProducts.slice(0, 3));
    console.log(`Last 3:`, allProducts.slice(-3));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testGetProducts();
