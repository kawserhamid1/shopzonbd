const router = require('express').Router();
const DB = require('../database');
const adminAuth = require('../middleware/adminAuth');
router.get('/', adminAuth, (req, res) => res.json({ orders: DB.getOrders(req.query) }));
router.get('/:id', (req, res) => { const o = DB.getOrder(req.params.id); if (!o) return res.status(404).json({ error:'Not found.' }); res.json(o); });
router.post('/', (req, res) => { if (!req.body.items?.length) return res.status(400).json({ error:'No items.' }); const o = DB.createOrder(req.body); res.status(201).json({ message:'Order placed!', order_id:o.id, total:o.total }); });
router.patch('/:id/status', adminAuth, (req, res) => { const valid=['pending','processing','shipped','delivered','cancelled']; if (!valid.includes(req.body.status)) return res.status(400).json({ error:'Invalid status.' }); const o = DB.updateOrderStatus(req.params.id, req.body.status); if (!o) return res.status(404).json({ error:'Not found.' }); res.json({ message:`${req.params.id} → ${req.body.status}` }); });
module.exports = router;