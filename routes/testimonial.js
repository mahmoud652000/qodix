const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const path = './data/testimonials.json';
const fs = require('fs');

// تأكد من وجود ملف data/testimonials.json
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
if (!fs.existsSync(path)) writeJSON(path, []);

// POST
router.post('/', upload.single('Image'), (req, res) => {
    const testimonials = readJSON(path);
    const newTestimonial = {
        id: Date.now(),
        Name: req.body.Name || '',
        JobOrCompany: req.body.JobOrCompany || '',
        Opinion: req.body.Opinion || '',
        Image: req.file ? req.file.path : null,
        createdAt: new Date().toISOString()
    };
    if (!newTestimonial.Name || !newTestimonial.Opinion)
        return res.status(400).json({ message: 'Name and Opinion are required.' });

    testimonials.push(newTestimonial);
    writeJSON(path, testimonials);
    res.status(201).json(newTestimonial);
});

// GET all
router.get('/', (req, res) => res.json(readJSON(path)));

// GET by ID
router.get('/:id', (req, res) => {
    const t = readJSON(path).find(x => x.id == req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    res.json(t);
});

// PUT
router.put('/:id', upload.single('Image'), (req, res) => {
    const testimonials = readJSON(path);
    const idx = testimonials.findIndex(x => x.id == req.params.id);
    if (idx < 0) return res.status(404).json({ message: 'Not found' });

    testimonials[idx] = {
        ...testimonials[idx],
        Name: req.body.Name ?? testimonials[idx].Name,
        JobOrCompany: req.body.JobOrCompany ?? testimonials[idx].JobOrCompany,
        Opinion: req.body.Opinion ?? testimonials[idx].Opinion,
        Image: req.file ? req.file.path : testimonials[idx].Image,
        updatedAt: new Date().toISOString()
    };
    writeJSON(path, testimonials);
    res.json(testimonials[idx]);
});

// DELETE
router.delete('/:id', (req, res) => {
    let testimonials = readJSON(path);
    const exists = testimonials.some(x => x.id == req.params.id);
    if (!exists) return res.status(404).json({ message: 'Not found' });

    testimonials = testimonials.filter(x => x.id != req.params.id);
    writeJSON(path, testimonials);
    res.json({ message: 'Deleted' });
});

module.exports = router;
