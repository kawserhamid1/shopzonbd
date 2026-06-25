require('dotenv').config();
const http = require('http');

// First login to get a valid token
const body = JSON.stringify({email:'test@shopzone.com', password:'password123'});
const req = http.request({hostname:'localhost',port:9001,path:'/api/users/login',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}}, res => {
  let d=''; res.on('data',c=>d+=c);
  res.on('end', () => {
    const login = JSON.parse(d);
    console.log('Login token:', login.token ? login.token.substring(0,30)+'...' : 'FAIL');
    if (!login.token) { console.log('Login failed:', d); process.exit(1); }

    // Test /me with the valid token
    http.get({hostname:'localhost',port:9001,path:'/api/users/me',headers:{Authorization:'Bearer '+login.token}}, meRes => {
      let d2=''; meRes.on('data',c=>d2+=c);
      meRes.on('end', () => {
        console.log('/me status:', meRes.statusCode);
        console.log('/me response:', d2.substring(0,200));
      });
    }).on('error', e => console.error('/me error:', e.message));
  });
});
req.on('error', e => console.error('Login error:', e.message));
req.write(body); req.end();
