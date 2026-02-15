require('dotenv').config(); // لتحميل المتغيرات من .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.static(path.join(__dirname, 'public')));

// 🔴 Health Check
app.get('/', (req, res) => {
  res.status(200).send('API is running 🚀');
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.log('MongoDB connection error:', err));

// API Routes
app.use('/api/Appointment', require('./routes/appointment'));
app.use('/api/Post', require('./routes/post'));

// ✅ تعديل مسار Projects ليكون متوافق مع الفرونت
app.use('/api/projects', require('./routes/project'));

app.use('/api/Technology', require('./routes/technology'));
app.use('/api/Testimonial', require('./routes/testimonial'));
app.use('/api/auth', require('./routes/auth'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
