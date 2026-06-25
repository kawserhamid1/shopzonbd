const router    = require('express').Router();
const { Customer, Order } = require('../models');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const result = await Promise.all(customers.map(async c => {
      const orders = await Order.find({ customer_email: c.email });
      const total_spent = orders.reduce((s,o)=>s+o.total,0);
      const last_order  = orders.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0]?.createdAt || null;
      return { ...c.toObject(), order_count: orders.length, total_spent: +total_spent.toFixed(2), last_order };
    }));
    result.sort((a,b) => b.total_spent - a.total_spent);
    const vip    = result.filter(c => c.total_spent > 1500).length;
    const avg_ltv = result.length ? Math.round(result.reduce((s,c)=>s+c.total_spent,0)/result.length) : 0;
    res.json({ customers: result, stats: { total: result.length, vip, new: result.filter(c=>c.status==='new').length, avg_ltv } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', adminAuth, async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found.' });
    const orders = await Order.find({ customer_email: c.email }).sort({ createdAt: -1 });
    res.json({ ...c.toObject(), orders });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
