const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const path = './data/projects.json';

// تحويل UsedTechnology
function parseUsedTech(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try { return JSON.parse(input); } catch { return input.split(',').map(t => t.trim()); }
}

// POST
router.post('/', upload.single('Image'), (req, res) => {
    const projects = readJSON(path);
    const usedTech = parseUsedTech(req.body.UsedTechnology);
    const newProject = {
        id: Date.now(),
        Name: req.body.Name,
        Description: req.body.Description,
        ProjectLink: req.body.ProjectLink,
        ProjectType: req.body.ProjectType || 'web',
        UsedTechnology: usedTech,
        TechnologyID: req.body.TechnologyID ? JSON.parse(req.body.TechnologyID) : [],
        Image: req.file ? req.file.path : null
    };
    projects.push(newProject);
    writeJSON(path, projects);
    res.json(newProject);
});

// GET all
router.get('/', (req, res) => res.json(readJSON(path)));

// PUT
router.put('/:id', upload.single('Image'), (req, res) => {
    const projects = readJSON(path);
    const idx = projects.findIndex(p => p.id == req.params.id);
    if (idx >= 0) {
        const usedTech = parseUsedTech(req.body.UsedTechnology);
        projects[idx] = {
            ...projects[idx],
            Name: req.body.Name || projects[idx].Name,
            Description: req.body.Description || projects[idx].Description,
            ProjectLink: req.body.ProjectLink || projects[idx].ProjectLink,
            ProjectType: req.body.ProjectType || projects[idx].ProjectType,
            UsedTechnology: usedTech.length ? usedTech : projects[idx].UsedTechnology,
            TechnologyID: req.body.TechnologyID ? JSON.parse(req.body.TechnologyID) : projects[idx].TechnologyID,
            Image: req.file ? req.file.path : projects[idx].Image
        };
        writeJSON(path, projects);
        res.json(projects[idx]);
    } else res.status(404).json({ msg: 'Not found' });
});

// DELETE
router.delete('/:id', (req, res) => {
    let projects = readJSON(path);
    projects = projects.filter(p => p.id != req.params.id);
    writeJSON(path, projects);
    res.json({ msg: 'Deleted' });
});

module.exports = router;
