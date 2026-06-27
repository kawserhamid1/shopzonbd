const router = require('express').Router();
const { readSettings, writeSettings } = require('../store/settings');
const adminAuth = require('../middleware/adminAuth');

// GET — Get all settings (public for terms display)
router.get('/', async (req, res) => {
  try {
    const settings = readSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET — Get only terms and conditions (public)
router.get('/terms', async (req, res) => {
  try {
    const settings = readSettings();
    res.json({
      termsAndConditions: settings.termsAndConditions || '',
      refundPolicy: settings.refundPolicy || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — Update settings (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    writeSettings(updated);
    res.json({ message: 'Settings updated!', settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — Update only terms (admin only)
router.put('/terms', adminAuth, async (req, res) => {
  try {
    const current = readSettings();
    if (req.body.termsAndConditions !== undefined) {
      current.termsAndConditions = req.body.termsAndConditions;
    }
    if (req.body.refundPolicy !== undefined) {
      current.refundPolicy = req.body.refundPolicy;
    }
    writeSettings(current);
    res.json({ message: 'Terms & Policy updated!', settings: current });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
