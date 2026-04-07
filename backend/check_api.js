async function checkAPI() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();
    console.log('API /products returned', data.products.length, 'products');

    const ids = data.products.map(p => p.id);
    const uniqueIds = new Set(ids);
    console.log('Unique IDs:', uniqueIds.size);
    if (uniqueIds.size !== data.products.length) {
      console.log('There are duplicate IDs!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAPI();