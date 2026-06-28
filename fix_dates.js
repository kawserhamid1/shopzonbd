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

  // Get all orders
  const ordersData = await apiCall('GET', '/api/orders');
  const allOrders = ordersData.orders;
  
  // Check which orders don't have createdAt
  console.log('Total orders:', allOrders.length);
  const missingDate = allOrders.filter(o => !o.createdAt);
  console.log('Orders without createdAt:', missingDate.length);
  
  // For seeded orders, update with a past date
  for (const order of missingDate) {
    // Set createdAt to a date 1-30 days ago
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    // We need to use mongoose to directly update since the API only updates status
    // For now, let's update status and hope the frontend handles it
    console.log('  Missing date:', order.id, '-', order.status, '- would set to', createdAt);
  }

  // Also try a direct MongoDB update via a special endpoint
  // Let's create a migration script that runs on the server
  
  // Alternative: update each order's status to trigger timestamps
  let fixed = 0;
  for (const order of missingDate) {
    // Update with current status - this triggers mongoose timestamps
    const result = await apiCall('PATCH', '/api/orders/' + order.id + '/status', JSON.stringify({
      status: order.status
    }));
    if (result.message) {
      fixed++;
    }
  }
  
  console.log('\nUpdated (trigger timestamps):', fixed, 'orders');
  
  // Verify
  const verify = await apiCall('GET', '/api/orders');
  console.log('\n=== Verification ===');
  for (const o of verify.orders) {
    const date = o.createdAt ? o.createdAt.substring(0, 16) : 'STILL MISSING';
    console.log('  ' + o.id + ' | ' + o.status + ' | ' + date);
  }
}

main().catch(console.error);
