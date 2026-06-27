const router = require('express').Router();
const { readRefunds, writeRefunds } = require('../store/refunds');
const adminAuth = require('../middleware/adminAuth');

// POST — Submit a refund request (public)
router.post('/', async (req, res) => {
  try {
    const { order_id, email, reason, details, customer_name } = req.body;
    if (!order_id || !email || !reason) {
      return res.status(400).json({ error: 'Order ID, email and reason are required.' });
    }

    const refunds = readRefunds();
    const newRefund = {
      id: 'REF-' + Date.now().toString(36).toUpperCase(),
      order_id,
      email,
      reason,
      details: details || '',
      customer_name: customer_name || '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    refunds.unshift(newRefund); // newest first
    writeRefunds(refunds);

    res.status(201).json({ message: 'Refund request submitted!', refund_id: newRefund.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — All refund requests (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const refunds = readRefunds();
    res.json({ refunds, total: refunds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH — Update refund status (admin)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'approved', 'rejected', 'processed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const refunds = readRefunds();
    const idx = refunds.findIndex(r => r.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Refund not found.' });

    refunds[idx].status = status;
    refunds[idx].updated_at = new Date().toISOString();
    writeRefunds(refunds);

    res.json({ message: `${req.params.id} → ${status}`, refund: refunds[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
