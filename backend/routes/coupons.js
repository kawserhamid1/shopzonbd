const router = require('express').Router();
const { readJSON, writeJSON } = require('../store/jsonStore');
const adminAuth = require('../middleware/adminAuth');

const FILE = 'coupons';

function readCoupons() { return readJSON(FILE) || []; }
function writeCoupons(data) { writeJSON(FILE, data); }

// GET all coupons
router.get('/', async (req, res) => {
  try { res.json({ coupons: readCoupons() }); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// POST create coupon
router.post('/', adminAuth, async (req, res) => {
  try {
    const { code, discount_type, discount_value, expiry, min_order, max_uses, status } = req.body;
    if (!code || !discount_value) return res.status(400).json({ error: 'Code and discount value required.' });
    const coupons = readCoupons();
    if (coupons.find(c => c.code.toLowerCase() === code.toLowerCase()))
      return res.status(409).json({ error: 'Coupon code already exists.' });
    const coupon = {
      id: 'CPN-' + Date.now().toString(36).toUpperCase(),
      code: code.toUpperCase(),
      discount_type: discount_type || 'percent',
      discount_value: +discount_value,
      expiry: expiry || null,
      min_order: +min_order || 0,
      max_uses: +max_uses || 0,
      used_count: 0,
      status: status || 'active',
      created_at: new Date().toISOString()
    };
    coupons.push(coupon);
    writeCoupons(coupons);
    res.status(201).json({ message: 'Coupon created!', coupon });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// PATCH update coupon
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const coupons = readCoupons();
    const idx = coupons.findIndex(c => c.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Coupon not found.' });
    coupons[idx] = { ...coupons[idx], ...req.body };
    writeCoupons(coupons);
    res.json({ message: 'Coupon updated!', coupon: coupons[idx] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE coupon
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const coupons = readCoupons();
    const filtered = coupons.filter(c => c.id !== req.params.id);
    writeCoupons(filtered);
    res.json({ message: 'Coupon deleted.' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST validate coupon (public - used at checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code, cart_total } = req.body;
    const coupons = readCoupons();
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (!coupon) return res.json({ valid: false, error: 'Invalid coupon code.' });
    if (coupon.status !== 'active') return res.json({ valid: false, error: 'Coupon is not active.' });
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) return res.json({ valid: false, error: 'Coupon expired.' });
    if (coupon_total < coupon.min_order) return res.json({ valid: false, error: `Minimum order $${coupon.min_order}.` });
    const discount = coupon.discount_type === 'percent' ? (cart_total * coupon.discount_value / 100) : coupon.discount_value;
    res.json({ valid: true, discount: Math.min(discount, cart_total), coupon });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
