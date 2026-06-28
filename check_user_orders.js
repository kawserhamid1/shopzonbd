const https = require('https');

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'shopzone-6q91.onrender.com',
      port: 443, path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (global.token) options.headers['Authorization'] = 'Bearer ' + global.token;
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Login as the customer (kawser@test-bd.com)
  // But we don't know the password! Let's check Admin orders API instead
  
  // Login as admin
  const login = await apiCall('POST', '/api/auth/login', JSON.stringify({
    email: 'kawser@shopzone.com', password: 'Admin@ShopZone2025'
  }));
  global.token = login.token;
  console.log('✅ Logged in as admin');

  // Get all orders
  const ordersData = await apiCall('GET', '/api/orders');
  console.log('Total orders:', ordersData.total);
  
  // Check orders by kawser@test-bd.com
  const kawserOrders = ordersData.orders.filter(o => o.customer_email === 'kawser@test-bd.com');
  console.log('Orders by kawser@test-bd.com:', kawserOrders.length);
  kawserOrders.forEach(o => console.log(' ', o.id, o.status, o.customer_email));
  
  // Check orders by hamid@test.com
  const hamidOrders = ordersData.orders.filter(o => o.customer_email === 'hamid@test.com');
  console.log('Orders by hamid@test.com:', hamidOrders.length);
  hamidOrders.forEach(o => console.log(' ', o.id, o.status, o.customer_email));

  // Check refunds
  console.log('\n=== Refunds ===');
  const refunds = await apiCall('GET', '/api/refunds');
  console.log('Total refunds:', refunds.total || 0);
  if (refunds.refunds) {
    refunds.refunds.forEach(r => console.log(' ', r.id, r.order_id, r.status, r.email));
  }
}

main().catch(console.error);
