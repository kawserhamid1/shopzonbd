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
  console.log('✅ Logged in');

  // Get all orders
  const ordersData = await apiCall('GET', '/api/orders');
  const allOrders = ordersData.orders;
  console.log('Total orders:', allOrders.length);

  // Fix each order
  let fixed = 0;
  for (const order of allOrders) {
    let needsUpdate = false;
    let newStatus = order.status;
    
    // Fix 1: New orders (have items with qty) should be "pending" not "processing"
    if (order.status === 'processing' && order.items && order.items.length > 0 && order.items[0].qty) {
      newStatus = 'pending';
      needsUpdate = true;
      console.log(`  📝 ${order.id}: status "processing" -> "pending"`);
    }
    
    if (needsUpdate) {
      await apiCall('PATCH', '/api/orders/' + order.id + '/status', JSON.stringify({
        status: newStatus
      }));
      fixed++;
    }
  }

  console.log('\n✅ Fixed', fixed, 'orders');
  
  // Verify
  const verify = await apiCall('GET', '/api/orders');
  console.log('\n=== After fix ===');
  for (const o of verify.orders) {
    const date = o.createdAt ? o.createdAt.substring(0, 16) : 'NO DATE';
    console.log(`  ${o.id} | status: ${o.status} | date: ${date}`);
  }
}

main().catch(console.error);
