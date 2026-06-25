require('dotenv').config();
const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)};
    if (token) headers.Authorization = 'Bearer ' + token;
    const req = http.request({hostname:'localhost',port:3001,path,method:'POST',headers}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

(async () => {
  // Login with the correct password (which was changed in the previous test!)
  const login = await post('/api/users/login', {email:'test@shopzone.com', password:'newpass999'});
  const loginData = JSON.parse(login.body);
  console.log('Login:', loginData.token ? 'OK' : 'FAIL:', loginData.error || '');
  
  if (!loginData.token) {
    console.log('Cannot proceed without login token');
    process.exit(1);
  }
  
  // Change password back
  const chg = await post('/api/users/change-password', {current_password:'newpass999', new_password:'password123'}, loginData.token);
  console.log('Change password status:', chg.status);
  console.log('Change password response:', chg.body);
  
  if (chg.status === 200) {
    // Verify login with new password
    const login2 = await post('/api/users/login', {email:'test@shopzone.com', password:'password123'});
    const login2Data = JSON.parse(login2.body);
    console.log('Login with reverted password:', login2Data.token ? 'OK' : 'FAIL');
  }
})();
