(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();
    if (!data || !Array.isArray(data.products)) {
      console.error('Invalid response shape');
      process.exit(2);
    }
    console.log('Total products:', data.products.length);
    console.log('First 6 products (id,name,discount,discount_percent):');
    data.products.slice(0,6).forEach(p => {
      console.log({ id: p.id, name: p.name, discount: p.discount, discount_percent: p.discount_percent });
    });
  } catch (err) {
    console.error('Error fetching products', err);
    process.exit(1);
  }
})();
