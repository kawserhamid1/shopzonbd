const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)};
    if (token) headers.Authorization = 'Bearer ' + token;
    const req = http.request({hostname:'localhost',port:3001,path,method:'POST',headers}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(JSON.parse(d)));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

(async () => {
  // Step 1: Login
  const login = await post('/api/users/login', {email:'test@shopzone.com', password:'password123'});
  console.log('1. Login:', login.token ? 'OK' : 'FAIL');
  const TOKEN = login.token;

  // Step 2: Change password
  const chg = await post('/api/users/change-password', {current_password:'password123', new_password:'newpass999'}, TOKEN);
  console.log('2. Change password:', JSON.stringify(chg));

  // Step 3: Login with new password
  const login2 = await post('/api/users/login', {email:'test@shopzone.com', password:'newpass999'});
  console.log('3. Login with new password:', login2.token ? 'OK' : 'FAIL', login2.body?.error || '');
})();
