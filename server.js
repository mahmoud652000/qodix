const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware عام
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ملفات ثابتة
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/Appointment', require('./routes/appointment'));
app.use('/api/Post', require('./routes/post'));
app.use('/api/Project', require('./routes/project'));
app.use('/api/Technology', require('./routes/technology'));
app.use('/api/Testimonial', require('./routes/testimonial'));
app.use('/api/auth', require('./routes/auth'));

// بدء السيرفر
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
