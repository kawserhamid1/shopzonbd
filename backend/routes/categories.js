const router = require('express').Router();
const { Category } = require('../models');
const adminAuth = require('../middleware/adminAuth');

// GET — All categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — Create category (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, emoji, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required.' });
    const exists = await Category.findOne({ name: new RegExp('^' + name + '$', 'i') });
    if (exists) return res.status(409).json({ error: 'Category already exists.' });
    const cat = await Category.create({ name, emoji: emoji || '📦', color: color || '#4f46e5' });
    res.status(201).json({ message: 'Category created!', category: cat });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH — Update category (admin)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    res.json({ message: 'Category updated!', category: cat });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — Delete category (admin), products become "Uncategorized"
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { Product } = require('../models');
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Category not found.' });
    // Move products to Uncategorized
    await Product.updateMany({ category: cat.name }, { category: 'Uncategorized' });
    res.json({ message: `Category "${cat.name}" deleted. Products moved to Uncategorized.` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
