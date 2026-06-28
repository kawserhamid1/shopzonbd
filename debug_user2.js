const https = require('https');

function apiCall(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'shopzone-6q91.onrender.com',
      port: 443, path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => { try { resolve({status: res.statusCode, data: JSON.parse(data)}); } catch(e) { resolve({status: res.statusCode, data: data.slice(0,300)}); } });
    });
    req.on('error', (e) => resolve({error: e.message}));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: User login
  console.log('=== Step 1: User Login ===');
  const userLogin = await apiCall('POST', '/api/users/login', JSON.stringify({
    email: 'kawser@test-bd.com', password: '123456'
  }));
  console.log('User login status:', userLogin.status);
  console.log('User login token:', userLogin.data?.token ? 'obtained' : 'none');
  console.log('User login error:', userLogin.data?.error || 'none');
  console.log('User login data keys:', Object.keys(userLogin.data || {}));
  
  // Step 2: Get orders with the USER token
  console.log('\n=== Step 2: Get Orders with User Token ===');
  const ordersResult = await apiCall('GET', '/api/users/orders', null, userLogin.data?.token);
  console.log('Orders status:', ordersResult.status);
  console.log('Orders data:', JSON.stringify(ordersResult.data).slice(0,300));
}

main().catch(console.error);
