const router = require('express').Router();
const DB = require('../database');
const adminAuth = require('../middleware/adminAuth');
router.get('/', (req, res) => { const p = DB.getProducts(req.query); res.json({ products: p, total: p.length }); });
router.get('/:id', (req, res) => { const p = DB.getProduct(req.params.id); if (!p) return res.status(404).json({ error:'Not found.' }); res.json(p); });
router.patch('/:id', adminAuth, (req, res) => { const p = DB.updateProduct(req.params.id, req.body); if (!p) return res.status(404).json({ error:'Not found.' }); res.json({ message:'Updated.', product:p }); });
router.patch('/:id/restock', adminAuth, (req, res) => { const p = DB.restockProduct(req.params.id, req.body.quantity||50); if (!p) return res.status(404).json({ error:'Not found.' }); res.json({ message:'Restocked.', new_stock:p.stock }); });
module.exports = router;