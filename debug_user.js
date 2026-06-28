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
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({error:data.slice(0,200)}); } });
    });
    req.on('error', (e) => resolve({error: e.message}));
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Login (we need to know user password - use admin to check)
  const login = await apiCall('POST', '/api/auth/login', JSON.stringify({
    email: 'kawser@shopzone.com', password: 'Admin@ShopZone2025'
  }));
  global.token = login.token;
  console.log('✅ Logged in as admin');

  // Check user orders via admin API
  const orders = await apiCall('GET', '/api/orders');
  const kawserOrders = orders.orders.filter(o => o.customer_email === 'kawser@test-bd.com');
  console.log('\nOrders by kawser@test-bd.com:', kawserOrders.length);
  kawserOrders.forEach(o => console.log(' ', o.id, o.createdAt?.substring(0,10)));

  // Check if there's a RegisteredUser for kawser@test-bd.com
  console.log('\n=== Simulating user login ===');
  
  // Try user login with the registered user
  const userLogin = await apiCall('POST', '/api/users/login', JSON.stringify({
    email: 'kawser@test-bd.com', password: '123456'
  }));
  console.log('User login result:', JSON.stringify(userLogin));
  
  // If user login works, test orders
  if(userLogin.token) {
    const userOrders = await apiCall('GET', '/api/users/orders');
    console.log('User orders (as user):', JSON.stringify(userOrders).slice(0,300));
  } else {
    console.log('User not registered or wrong password');
    
    // Register a user if not exists
    console.log('\nAttempting to register...');
    const reg = await apiCall('POST', '/api/users/register', JSON.stringify({
      name: 'kawser', email: 'kawser@test-bd.com', password: 'test1234'
    }));
    console.log('Register result:', JSON.stringify(reg));
  }
}

main().catch(console.error);
