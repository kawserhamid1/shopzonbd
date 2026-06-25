require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/api/health', (req, res) => res.json({ status:'ok', message:'ShopZone running!', time: new Date() }));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../frontend/admin.html')));
app.get('*',     (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

app.use((err, req, res, next) => {
  console.error('Express error handler:', err.message, err.stack);
  res.status(500).json({ error: 'Server error.', detail: err.message });
});

app.listen(PORT, () => {
  console.log('\n✅ ShopZone running!');
  console.log('🛍️  Shop:  http://localhost:3001');
  console.log('⚙️  Admin: http://localhost:3001/admin');
  console.log('📡 API:   http://localhost:3001/api/health\n');
});