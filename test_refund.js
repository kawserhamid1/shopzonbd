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
  // Login as admin
  const login = await apiCall('POST', '/api/auth/login', JSON.stringify({
    email: 'kawser@shopzone.com', password: 'Admin@ShopZone2025'
  }));
  global.token = login.token;
  console.log('✅ Logged in');

  // Test: Submit a refund for ORD-MQWF4GYJ
  console.log('\n=== Submitting Refund ===');
  const refund = await apiCall('POST', '/api/refunds', JSON.stringify({
    order_id: 'ORD-MQWF4GYJ',
    email: 'kawser@test-bd.com',
    reason: 'defective',
    details: 'Product not working properly'
  }));
  console.log('Refund result:', JSON.stringify(refund, null, 2));

  // Check refund status
  console.log('\n=== Check Refunds ===');
  const refunds = await apiCall('GET', '/api/refunds');
  console.log('Total refunds:', refunds.total);
  if (refunds.refunds) {
    refunds.refunds.forEach(r => console.log(' ', r.id, r.order_id, r.status, r.reason));
  }

  // Test user orders
  console.log('\n=== Test Admin Orders ===');
  const orders = await apiCall('GET', '/api/orders');
  const kawserOrders = orders.orders.filter(o => o.customer_email === 'kawser@test-bd.com');
  console.log('kawser@test-bd.com orders:', kawserOrders.length);
  for (const o of kawserOrders.slice(0, 3)) {
    console.log(' ', o.id, o.status, o.createdAt ? o.createdAt.substring(0,10) : 'NO DATE');
  }
}

main().catch(console.error);
