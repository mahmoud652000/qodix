const express = require('express');
const router = express.Router();
const Technology = require('../models/technology');

// GET جميع التقنيات
router.get('/', async (req, res) => {
  try {
    const techs = await Technology.find();
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST إنشاء تقنية جديدة
router.post('/', async (req, res) => {
  try {
    const newTech = new Technology(req.body);
    const saved = await newTech.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE حذف تقنية
router.delete('/:id', async (req, res) => {
  try {
    await Technology.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
