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
          console.log('Raw response:', data);
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
  // Step 1: Login
  console.log('=== Logging in...');
  const loginData = await apiCall('POST', '/api/auth/login', JSON.stringify({
    email: 'kawser@shopzone.com',
    password: 'Admin@ShopZone2025'
  }));
  global.token = loginData.token;
  console.log('✅ Logged in as:', loginData.admin.name);

  // Step 2: Get all orders
  console.log('\n=== Getting orders...');
  const ordersData = await apiCall('GET', '/api/orders');
  console.log('Total orders:', ordersData.total);

  // Step 3: Find orders that need fixing
  const toFix = ordersData.orders.filter(o => {
    // Fix: new orders (have items) but status is "processing" 
    return o.status === 'processing' && o.items && o.items.length > 0;
  });
  console.log('\nOrders to fix (processing -> pending):', toFix.length);

  // Step 4: Update each order
  for (const order of toFix) {
    const result = await apiCall('PATCH', '/api/orders/' + order.id + '/status', JSON.stringify({
      status: 'pending'
    }));
    if (result.message) {
      console.log('  ✅', order.id, '-> pending');
    } else {
      console.log('  ❌', order.id, ':', JSON.stringify(result));
    }
  }

  // Step 5: Verify
  console.log('\n=== Verification ===');
  const verifyData = await apiCall('GET', '/api/orders');
  for (const o of verifyData.orders.slice(0, 5)) {
    console.log('  ', o.id, '| status:', o.status, '| date:', (o.createdAt || 'MISSING').substring(0, 16));
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
