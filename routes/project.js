const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const path = require('path');

// استخدام مسار مطلق للـ JSON
const filePath = path.join(__dirname, '../data/projects.json');

// تحويل UsedTechnology
function parseUsedTech(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try { return JSON.parse(input); } catch { return input.split(',').map(t => t.trim()); }
}

// ===================== POST =====================
router.post('/', upload.single('Image'), (req, res) => {
    try {
        const projects = readJSON(filePath);
        const usedTech = parseUsedTech(req.body.UsedTechnology);
        const newProject = {
            id: Date.now(),
            Name: req.body.Name,
            Description: req.body.Description,
            ProjectLink: req.body.ProjectLink,
            ProjectType: req.body.ProjectType || 'web',
            UsedTechnology: usedTech,
            TechnologyID: req.body.TechnologyID ? JSON.parse(req.body.TechnologyID) : [],
            Image: req.file ? req.file.filename : null // استخدام filename فقط للـ upload folder
        };
        projects.push(newProject);
        writeJSON(filePath, projects);
        res.json(newProject);
    } catch (err) {
        res.status(500).json({ msg: 'Error adding project', error: err.message });
    }
});

// ===================== GET all =====================
router.get('/', (req, res) => {
    try {
        const projects = readJSON(filePath);
        res.json(projects);
    } catch (err) {
        res.status(500).json({ msg: 'Error reading projects', error: err.message });
    }
});

// ===================== PUT =====================
router.put('/:id', upload.single('Image'), (req, res) => {
    try {
        const projects = readJSON(filePath);
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
                Image: req.file ? req.file.filename : projects[idx].Image
            };
            writeJSON(filePath, projects);
            res.json(projects[idx]);
        } else res.status(404).json({ msg: 'Project not found' });
    } catch (err) {
        res.status(500).json({ msg: 'Error updating project', error: err.message });
    }
});

// ===================== DELETE =====================
router.delete('/:id', (req, res) => {
    try {
        let projects = readJSON(filePath);
        projects = projects.filter(p => p.id != req.params.id);
        writeJSON(filePath, projects);
        res.json({ msg: 'Deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting project', error: err.message });
    }
});

module.exports = router;
