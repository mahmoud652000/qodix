const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Routes
app.use('/api/Appointment', require('./routes/appointment'));
app.use('/api/Post', require('./routes/post'));
app.use('/api/Project', require('./routes/project'));
app.use('/api/Technology', require('./routes/technology'));
app.use('/api/Testimonial', require('./routes/testimonial'));
app.use('/api/auth', require('./routes/auth'));

// React build (Frontend)
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Fallback لجميع الـ routes اللي مش موجودة في الـ API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Route اختبار
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Node works!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
