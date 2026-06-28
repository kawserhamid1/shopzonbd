const https = require('https');

async function main() {
  // First, get the token
  const postData = JSON.stringify({email:'kawser@test-bd.com',password:'123456'});
  
  const loginReq = https.request({
    hostname: 'shopzone-6q91.onrender.com',
    port: 443,
    path: '/api/users/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      const loginData = JSON.parse(data);
      console.log('Login success:', !!loginData.token);
      console.log('Token starts with:', loginData.token?.substring(0,20));
      
      // Now use the token to get orders
      const orderReq = https.request({
        hostname: 'shopzone-6q91.onrender.com',
        port: 443,
        path: '/api/users/orders',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loginData.token
        }
      }, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => data2 += chunk);
        res2.on('end', () => {
          console.log('\nOrders status:', res2.statusCode);
          console.log('Orders response:', data2.substring(0,200));
        });
      });
      orderReq.on('error', console.error);
      orderReq.end();
    });
  });
  loginReq.on('error', console.error);
  loginReq.write(postData);
  loginReq.end();
}

main().catch(console.error);
