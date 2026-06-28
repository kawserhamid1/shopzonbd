const router    = require('express').Router();
const { Order, Customer, Product } = require('../models');
const adminAuth = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(+limit);
    res.json({ orders, total: orders.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, items, subtotal, tax, shipping_cost, shipping_method, payment_method, shipping_address } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items.' });
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const total = subtotal + tax + (shipping_cost || 0);
    const orderDate = new Date();
    let customer = await Customer.findOne({ email: customer_email });
    if (!customer) customer = await Customer.create({ name: customer_name, email: customer_email });
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, { $inc: { stock: -item.qty, sold: item.qty } });
    }
    const order = await Order.create({
      id: orderId, customer_id: customer._id.toString(),
      customer_name, customer_email, subtotal, tax,
      shipping_cost: shipping_cost || 0, total, status: 'pending',
      createdAt: orderDate,
      payment_method: payment_method || 'Credit Card',
      shipping_method: shipping_method || 'standard',
      shipping_address: shipping_address || '',
      items
    });
    res.status(201).json({ message: 'Order placed!', order_id: order.id, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const valid = ['pending','processing','shipped','delivered','cancelled'];
    if (!valid.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status.' });
    const order = await Order.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Not found.' });
    res.json({ message: `${req.params.id} → ${req.body.status}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
