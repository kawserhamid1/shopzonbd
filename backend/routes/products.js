const router    = require('express').Router();
const { Product } = require('../models');
const adminAuth = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try {
    const { search, category, min_price, max_price, brand, sort, limit = 20 } = req.query;
    const query = { status: 'active' };
    if (search) query.$or = [{ name: new RegExp(search,'i') }, { brand: new RegExp(search,'i') }, { tags: new RegExp(search,'i') }];
    if (category && category !== 'All') query.category = category;
    if (brand) query.brand = brand;
    if (min_price || max_price) { query.price = {}; if (min_price) query.price.$gte = +min_price; if (max_price) query.price.$lte = +max_price; }
    const sortMap = { popular:{sold:-1}, price_low:{price:1}, price_high:{price:-1}, rating:{rating:-1}, newest:{createdAt:-1} };
    const sortObj = sortMap[sort] || {sold:-1};
    const products = await Product.find(query).sort(sortObj).limit(+limit);
    res.json({ products, total: products.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { sku: req.params.id }] });
    if (!p) return res.status(404).json({ error: 'Not found.' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ error: 'Not found.' });
    res.json({ message: 'Updated.', product: p });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/restock', adminAuth, async (req, res) => {
  try {
    const qty = +(req.body.quantity || 50);
    const p = await Product.findByIdAndUpdate(req.params.id, { $inc: { stock: qty } }, { new: true });
    if (!p) return res.status(404).json({ error: 'Not found.' });
    res.json({ message: `Restocked +${qty}`, new_stock: p.stock });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
