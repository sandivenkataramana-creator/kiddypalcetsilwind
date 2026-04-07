const db = require('../config/db');
(async () => {
  try {
    const [res] = await db.query("INSERT INTO products (name, product_code, description, price, stock_quantity) VALUES (?,?,?,?,?)", ['Case Test Product','CASECODE123','desc',100,5]);
    console.log('inserted', res.insertId);
  } catch (err) {
    console.error('err', err.message);
  } finally {
    process.exit(0);
  }
})();