const router = require('express').Router();
const DB = require('../database');
const adminAuth = require('../middleware/adminAuth');
router.get('/', adminAuth, (req, res) => res.json(DB.getInventory()));
module.exports = router;