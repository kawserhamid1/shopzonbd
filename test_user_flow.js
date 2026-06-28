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
      res.on('end', () => { resolve({status: res.statusCode, data: data.slice(0,300)}); });
    });
    req.on('error', (e) => resolve({error: e.message}));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: User login to get token
  const login = await apiCall('POST', '/api/users/login', JSON.stringify({
    email: 'kawser@test-bd.com', password: '123456'
  }));
  const token = login.data.token;
  console.log('Got token from user login');

  // Step 2: Call /api/users/orders
  console.log('\n=== /api/users/orders ===');
  const orders = await apiCall('GET', '/api/users/orders', null, token);
  console.log('Status:', orders.status);
  console.log('Response:', orders.data);

  // Step 3: Call /api/refunds/user
  console.log('\n=== /api/refunds/user ===');
  const refunds = await apiCall('GET', '/api/refunds/user', null, token);
  console.log('Status:', refunds.status);
  console.log('Response:', refunds.data);
  
  // Step 4: Call /api/users/me
  console.log('\n=== /api/users/me ===');
  const me = await apiCall('GET', '/api/users/me', null, token);
  console.log('Status:', me.status);
  console.log('Response:', me.data);
}

main().catch(console.error);
