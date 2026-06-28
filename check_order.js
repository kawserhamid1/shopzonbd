const https = require('https');

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'shopzone-6q91.onrender.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (global.token) {
      options.headers['Authorization'] = 'Bearer ' + global.token;
    }
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          console.log('Raw:', data);
          reject(e);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Login
  const loginData = await apiCall('POST', '/api/auth/login', JSON.stringify({
    email: 'kawser@shopzone.com',
    password: 'Admin@ShopZone2025'
  }));
  global.token = loginData.token;

  // Get specific order
  console.log('=== Checking ORD-MQWIG0B5 ===');
  const order = await apiCall('GET', '/api/orders/ORD-MQWIG0B5');
  console.log('Order:', JSON.stringify(order, null, 2));

  // If no createdAt, fix it
  if (!order.createdAt && order._id) {
    console.log('\n❌ createdAt missing! Updating...');
    const result = await apiCall('PATCH', '/api/orders/ORD-MQWIG0B5/status', JSON.stringify({
      status: order.status || 'pending'
    }));
    console.log('Update result:', JSON.stringify(result));
  } else if (order.createdAt) {
    console.log('\n✅ createdAt exists:', order.createdAt);
  }

  // Also check for any other orders without createdAt
  console.log('\n=== Checking all orders for missing createdAt ===');
  const allOrders = await apiCall('GET', '/api/orders');
  const missing = allOrders.orders.filter(o => !o.createdAt);
  console.log('Orders without createdAt:', missing.length);
  missing.forEach(o => console.log(' -', o.id, o.status));
}

main().catch(console.error);
