require('dotenv').config();
const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)};
    if (token) headers.Authorization = 'Bearer ' + token;
    const req = http.request({hostname:'localhost',port:3001,path,method:'POST',headers}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve({status:res.statusCode,body:JSON.parse(d)})}catch(e){resolve({status:res.statusCode,body:d.slice(0,100)})}});
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function patch(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)};
    if (token) headers.Authorization = 'Bearer ' + token;
    const req = http.request({hostname:'localhost',port:3001,path,method:'PATCH',headers}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve({status:res.statusCode,body:JSON.parse(d)})}catch(e){resolve({status:res.statusCode,body:d.slice(0,100)})}});
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = token ? {Authorization:'Bearer '+token} : {};
    http.get({hostname:'localhost',port:3001,path,headers}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{try{resolve({status:res.statusCode,body:JSON.parse(d)})}catch(e){resolve({status:res.statusCode,body:d.slice(0,100)})}});
    }).on('error', reject);
  });
}

(async () => {
  let pass = 0, fail = 0;
  const assert = (test, cond, msg) => { if (cond) { console.log(`✅ ${test}: ${msg||'OK'}`); pass++; } else { console.log(`❌ ${test}: ${msg||'FAIL'}`); fail++; } };

  // TEST 1: Register new user (unique email)
  const reg = await post('/api/users/register', {name:'New Customer', email:'newcust@shopzone.com', password:'test123456', phone:'+880****0000'});
  assert('1. Register', reg.body.token && reg.body.user, reg.body.error || 'user created');

  // TEST 2: Login with correct credentials
  const login = await post('/api/users/login', {email:'test@shopzone.com', password:'password123'});
  const TOKEN=login...  assert('2. Login', !!TOKEN, login.body.error || 'token received');

  // TEST 3: Wrong password
  const wrong = await post('/api/users/login', {email:'test@shopzone.com', password:'wrongpass'});
  assert('3. Wrong password', wrong.status === 401, wrong.body.error || '');

  // TEST 4: Duplicate email
  const dup = await post('/api/users/register', {name:'Test', email:'test@shopzone.com', password:'password123'});
  assert('4. Duplicate email', dup.status === 409 && dup.body.error.includes('already'), dup.body.error || '');

  // TEST 5: /me with valid token
  const me = await get('/api/users/me', TOKEN);
  assert('5. /me', me.body.name === 'Test User' && me.body.email === 'test@shopzone.com', JSON.stringify(me.body));

  // TEST 6: /me without token
  const meNoToken = await get('/api/users/me');
  assert('6. /me no auth', meNoToken.status === 401, meNoToken.body.error || '');

  // TEST 7: /orders
  const orders = await get('/api/users/orders', TOKEN);
  assert('7. /orders', orders.body.orders !== undefined, `total: ${orders.body.total}`);

  // TEST 8: Profile update
  const upd = await patch('/api/users/me', {name:'Updated Name', phone:'+880****9999'}, TOKEN);
  assert('8. Profile update', upd.body.user?.name === 'Updated Name', upd.body.user?.name || '');

  // TEST 9: Change password
  const chg = await post('/api/users/change-password', {current_password:'password123', new_password:'newpass999'}, TOKEN);
  assert('9. Change password', chg.status === 200 && chg.body.message, chg.body.error || chg.body.message);

  // TEST 10: Login with new password
  const login2 = await post('/api/users/login', {email:'test@shopzone.com', password:'newpass999'});
  assert('10. Login new pass', !!login2.body.token, login2.body.error || '');

  // TEST 11: /me with new token
  const me2 = await get('/api/users/me', login2.body.token);
  assert('11. /me after update', me2.body.name === 'Updated Name', me2.body.name || '');

  // TEST 12: Register validation (short password)
  const short = await post('/api/users/register', {name:'X', email:'x@x.com', password:'123'});
  assert('12. Short password', short.status === 400, short.body.error || '');

  // TEST 13: Register validation (invalid email)
  const badEmail = await post('/api/users/register', {name:'Test', email:'notanemail', password:'password123'});
  assert('13. Invalid email', badEmail.status === 400, badEmail.body.error || '');

  console.log(`\n=== RESULTS: ${pass} passed, ${fail} failed out of ${pass+fail} tests ===`);
  if (fail > 0) process.exit(1);
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
