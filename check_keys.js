const https = require('https');

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'shopzone-6q91.onrender.com',
      port: 443,
      path: path,
      method: method,
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
  const login = await apiCall('POST', '/api/auth/login', JSON.stringify({
    email: 'kawser@shopzone.com', password: 'Admin@ShopZone2025'
  }));
  global.token = login.token;
  
  const ordersData = await apiCall('GET', '/api/orders');
  const firstOrder = ordersData.orders[0];
  console.log('Order keys:', Object.keys(firstOrder).join(', '));
  console.log('createdAt:', firstOrder.createdAt);
  console.log('created_at:', firstOrder.created_at);
}

main().catch(console.error);
