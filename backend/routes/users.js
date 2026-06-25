require('dotenv').config();
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const DB      = require('../database');
const { requireUser } = require('../middleware/userAuth');

// ── POST /api/users/register ────────────────────────────────────
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validation
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });
  if (name.trim().length < 2)
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = DB.registerUser({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword, phone });

  if (result.error) return res.status(409).json({ error: result.error });

  // Auto-login after register
  const token = jwt.sign(
    { id: result.id, email: result.email, name: result.name, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.status(201).json({
    message: 'Account created successfully! Welcome to ShopZone 🎉',
    token,
    user: result
  });
});

// ── POST /api/users/login ───────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const result = DB.loginUser(email.toLowerCase().trim(), password);
  if (result.error) return res.status(401).json({ error: result.error });

  const token = jwt.sign(
    { id: result.id, email: result.email, name: result.name, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    message: `Welcome back, ${result.name}! 🎉`,
    token,
    user: result
  });
});

// ── GET /api/users/me ───────────────────────────────────────────
router.get('/me', requireUser, (req, res) => {
  const user = DB.getUser(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json(user);
});

// ── PATCH /api/users/me ─────────────────────────────────────────
router.patch('/me', requireUser, (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name)  updates.name  = name.trim();
  if (phone) updates.phone = phone.trim();
  const updated = DB.updateUser(req.user.id, updates);
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  res.json({ message: 'Profile updated.', user: updated });
});

// ── POST /api/users/change-password ────────────────────────────
router.post('/change-password', requireUser, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Both current and new password required.' });
  if (new_password.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });

  const fs   = require('fs');
  const path = require('path');
  const bcrypt = require('bcryptjs');

  // Use absolute path — this always works regardless of working directory
  const dbPath = path.join(__dirname, '..', 'db.json');

  if (!fs.existsSync(dbPath))
    return res.status(500).json({ error: 'Database file not found.' });

  const rawDB   = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const rawUser = rawDB.registered_users
    ? rawDB.registered_users.find(u => u.id == req.user.id)
    : null;

  if (!rawUser)
    return res.status(404).json({ error: 'User not found.' });

  if (!bcrypt.compareSync(current_password, rawUser.password))
    return res.status(401).json({ error: 'Current password is incorrect.' });

  DB.updateUser(req.user.id, { password: new_password });
  res.json({ message: 'Password changed successfully.' });
});

// ── GET /api/users/orders ───────────────────────────────────────
router.get('/orders', requireUser, (req, res) => {
  const orders = DB.getUserOrders(req.user.email);
  res.json({ orders, total: orders.length });
});

// ── GET /api/users/orders/:id ───────────────────────────────────
router.get('/orders/:id', requireUser, (req, res) => {
  const order = DB.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.customer_email !== req.user.email)
    return res.status(403).json({ error: 'Access denied.' });
  res.json(order);
});

module.exports = router;
