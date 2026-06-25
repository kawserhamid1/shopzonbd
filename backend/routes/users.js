require('dotenv').config();
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { RegisteredUser, Order } = require('../models');
const { requireUser } = require('../middleware/userAuth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const exists = await RegisteredUser.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered.' });
    const colors = ['#4f46e5','#0891b2','#059669','#dc2626','#7c3aed','#db2777','#ea580c'];
    const user = await RegisteredUser.create({
      name: name.trim(), email: email.toLowerCase(),
      password: bcrypt.hashSync(password, 10),
      phone: phone || '',
      avatar_color: colors[Math.floor(Math.random()*colors.length)]
    });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, type:'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ message: 'Account created! Welcome to ShopZone 🎉', token, user: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const user = await RegisteredUser.findOne({ email: email.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, type:'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user.toObject();
    res.json({ message: `Welcome back, ${user.name}! 🎉`, token, user: safeUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', requireUser, async (req, res) => {
  try {
    const user = await RegisteredUser.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/me', requireUser, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    const user = await RegisteredUser.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated.', user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/change-password', requireUser, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required.' });
    if (new_password.length < 6) return res.status(400).json({ error: 'New password min 6 characters.' });
    const user = await RegisteredUser.findById(req.user.id);
    if (!bcrypt.compareSync(current_password, user.password))
      return res.status(401).json({ error: 'Current password is incorrect.' });
    user.password = bcrypt.hashSync(new_password, 10);
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders', requireUser, async (req, res) => {
  try {
    const orders = await Order.find({ customer_email: req.user.email }).sort({ createdAt: -1 });
    res.json({ orders, total: orders.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders/:id', requireUser, async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.customer_email !== req.user.email) return res.status(403).json({ error: 'Access denied.' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
