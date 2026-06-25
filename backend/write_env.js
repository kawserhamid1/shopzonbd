const fs = require('fs');
const content = [
  'PORT=3000',
  'JWT_SECRET=shopzo...',
  'JWT_EXPIRES_IN=7d',
  'ADMIN_EMAIL=kawser@shopzone.com',
  'ADMIN_PASSWORD=Admin@...',
  'NODE_ENV=development',
  'STRIPE_SECRET_KEY=***,
  'STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here',
  'STRIPE_WEBHOOK_SECRET=whsec_...
].join('\n') + '\n';
fs.writeFileSync('`, content);
console.log('✅ .env written');
