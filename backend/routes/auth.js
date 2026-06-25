require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DB = require('../database');
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const admin = DB.getAdmin(email);
  if (!admin || !bcrypt.compareSync(password, admin.password))
    return res.status(401).json({ error: 'Invalid credentials.' });
  const token = jwt.sign({ id:admin.id, email:admin.email, name:admin.name }, process.env.JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, admin: { id:admin.id, name:admin.name, email:admin.email } });
});
module.exports = router;