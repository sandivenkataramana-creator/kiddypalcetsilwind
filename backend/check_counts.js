const db = require('./config/db');

async function checkProductCounts() {
  try {
    // Total products
    const [total] = await db.query('SELECT COUNT(*) as count FROM products');
    console.log('Total products in DB:', total[0].count);

    // Products with stock > 0
    const [inStock] = await db.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity > 0');
    console.log('Products with stock > 0:', inStock[0].count);

    // Products with stock = 0 or NULL
    const [outOfStock] = await db.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 0 OR stock_quantity IS NULL');
    console.log('Products out of stock:', outOfStock[0].count);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProductCounts();