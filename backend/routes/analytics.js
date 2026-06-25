const router    = require('express').Router();
const { Product, Order, Customer } = require('../models');
const adminAuth = require('../middleware/adminAuth');

router.get('/summary', adminAuth, async (req, res) => {
  try {
    const [products, orders, customers] = await Promise.all([
      Product.find(), Order.find(), Customer.find()
    ]);
    const revenue     = orders.filter(o=>o.status!=='cancelled').reduce((s,o) => s+o.total, 0);
    const topProducts = [...products].sort((a,b) => b.sold-a.sold).slice(0,5);
    const catProfit   = {};
    products.forEach(p => { catProfit[p.category] = (catProfit[p.category]||0) + (p.price-p.cost)*p.sold; });
    const statusCounts = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status]||0)+1; });
    res.json({
      revenue:          +revenue.toFixed(2),
      orders:           orders.length,
      customers:        customers.length,
      products:         products.length,
      top_products:     topProducts,
      category_profit:  Object.entries(catProfit).map(([category,profit]) => ({ category, profit: Math.round(profit) })).sort((a,b) => b.profit-a.profit),
      order_status:     Object.entries(statusCounts).map(([status,count]) => ({ status, count }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
