const express = require('express');
const router = express.Router();
const Project = require('../models/project');
const multer = require('multer');
const path = require('path');

/* ================= Multer Config ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExt = /jpg|jpeg|png|gif|bmp|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.test(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ================= GET all projects ================= */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= POST new project ================= */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { Name, Description, ProjectType, ProjectLink, UsedTechnology } = req.body;

    if (!Name || !Description || !ProjectType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const project = new Project({
      Name,
      Description,
      ProjectType,
      ProjectLink,
      UsedTechnology: UsedTechnology ? UsedTechnology.split(',') : [],
      Image: req.file ? `upload/${req.file.filename}` : ''
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= DELETE project ================= */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
