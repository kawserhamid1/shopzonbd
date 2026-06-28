const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { RegisteredUser } = require('../models');

// POST — Reset password (dev only - removes in production)
router.post('/reset-password-dev', async (req, res) => {
  try {
    const { email, new_password } = req.body;
    if (!email || !new_password) return res.status(400).json({ error: 'Email and new_password required.' });
    
    const user = await RegisteredUser.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    user.password = bcrypt.hashSync(new_password, 10);
    await user.save();
    
    res.json({ message: `Password reset for ${email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
