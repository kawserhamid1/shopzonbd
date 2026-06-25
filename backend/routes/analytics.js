const router = require('express').Router();
const DB = require('../database');
const adminAuth = require('../middleware/adminAuth');

router.get('/summary', adminAuth, (req, res) => {
  res.json(DB.getAnalytics());
});

module.exports = router;
