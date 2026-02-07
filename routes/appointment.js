const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const path = './data/appointments.json';

// POST
router.post('/', upload.single('file'), (req, res) => {
    const appointments = readJSON(path);
    const newAppointment = { id: Date.now(), ...req.body, file: req.file ? req.file.path : null };
    appointments.push(newAppointment);
    writeJSON(path, appointments);
    res.json(newAppointment);
});

// GET
router.get('/', (req, res) => res.json(readJSON(path)));

module.exports = router;
