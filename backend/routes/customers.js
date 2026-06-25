const router = require('express').Router();
const DB = require('../database');
const adminAuth = require('../middleware/adminAuth');
router.get('/', adminAuth, (req, res) => {
  const customers = DB.getCustomers();
  const vip = customers.filter(c=>c.total_spent>1500).length;
  const avg_ltv = customers.length ? Math.round(customers.reduce((s,c)=>s+c.total_spent,0)/customers.length) : 0;
  res.json({ customers, stats:{ total:customers.length, vip, new:customers.filter(c=>c.status==='new').length, avg_ltv } });
});
router.get('/:id', adminAuth, (req, res) => { const c = DB.getCustomer(req.params.id); if (!c) return res.status(404).json({ error:'Not found.' }); res.json(c); });
module.exports = router;