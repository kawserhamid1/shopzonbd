const router    = require('express').Router();
const { Product } = require('../models');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ stock: 1 });
    const stats = {
      total_items:   products.reduce((s,p) => s+p.stock, 0),
      cost_value:    +products.reduce((s,p) => s+p.cost*p.stock, 0).toFixed(2),
      retail_value:  +products.reduce((s,p) => s+p.price*p.stock, 0).toFixed(2),
      low_stock:     products.filter(p => p.stock <= 8),
      critical:      products.filter(p => p.stock <= 3),
    };
    res.json({ products, stats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
