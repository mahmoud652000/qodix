require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

/* ================= Middleware ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= Static Files ================= */
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.static(path.join(__dirname, 'public')));

/* ================= Health Check ================= */
app.get('/', (req, res) => {
  res.status(200).send('API is running 🚀');
});

/* ================= MongoDB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.error('MongoDB error ❌', err));

/* ================= API Routes (lowercase مهم جدًا) ================= */
app.use('/api/appointment', require('./routes/appointment'));
app.use('/api/post', require('./routes/post'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/technology', require('./routes/technology'));
app.use('/api/testimonial', require('./routes/testimonial'));
app.use('/api/auth', require('./routes/auth'));

/* ================= 404 Handler ================= */
app.use((req, res) => {
  res.status(404).json({ message: 'Route Not Found' });
});

/* ================= Start Server ================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
