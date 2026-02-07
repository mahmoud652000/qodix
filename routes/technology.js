const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const path = './data/technologies.json';

// POST
router.post('/', upload.single('Image'), (req, res) => {
    const techs = readJSON(path);
    const newTech = { id: Date.now(), TechnologyName: req.body.TechnologyName, Image: req.file ? req.file.path : null };
    techs.push(newTech);
    writeJSON(path, techs);
    res.json(newTech);
});

// GET
router.get('/', (req, res) => res.json(readJSON(path)));

// PUT
router.put('/:id', upload.single('Image'), (req, res) => {
    const techs = readJSON(path);
    const idx = techs.findIndex(t => t.id == req.params.id);
    if (idx >= 0) {
        techs[idx] = {
            ...techs[idx],
            TechnologyName: req.body.TechnologyName || techs[idx].TechnologyName,
            Image: req.file ? req.file.path : techs[idx].Image
        };
        writeJSON(path, techs);
        res.json(techs[idx]);
    } else res.status(404).json({ msg: 'Not found' });
});

// DELETE
router.delete('/:id', (req, res) => {
    let techs = readJSON(path);
    techs = techs.filter(t => t.id != req.params.id);
    writeJSON(path, techs);
    res.json({ msg: 'Deleted' });
});

module.exports = router;
