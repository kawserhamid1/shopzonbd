const https = require('https');
const http = require('http');

function apiCall(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const isHttps = true;
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
      res.on('end', () => { resolve({status: res.statusCode, body: data}); });
    });
    req.on('error', (e) => resolve({error: e.message}));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Step 1: User login
  const loginRes = await apiCall('POST', '/api/users/login', JSON.stringify({
    email: 'kawser@test-bd.com', password: '123456'
  }));
  
  console.log('Login status:', loginRes.status);
  
  try {
    const loginData = JSON.parse(loginRes.body);
    const token = loginData.token;
    console.log('Token obtained:', token ? token.substring(0,30)+'...' : 'NONE');
    
    // Step 2: Get user orders
    console.log('\n=== /api/users/orders ===');
    const ordersRes = await apiCall('GET', '/api/users/orders', null, token);
    console.log('Status:', ordersRes.status);
    console.log('Body length:', ordersRes.body.length);
    console.log('Body:', ordersRes.body.substring(0,500));
  } catch(e) {
    console.log('Parse error:', e.message);
    console.log('Raw body:', loginRes.body.substring(0,300));
  }
}

main().catch(console.error);
