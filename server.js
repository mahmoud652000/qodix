const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

/* ================= Middleware ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= Static Files ================= */
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(express.static(path.join(__dirname, 'public')));

/* ================= API Routes ================= */
app.use('/api/Appointment', require('./routes/appointment'));
app.use('/api/Post', require('./routes/post'));
app.use('/api/Project', require('./routes/project'));
app.use('/api/Technology', require('./routes/technology'));
app.use('/api/Testimonial', require('./routes/testimonial'));
app.use('/api/auth', require('./routes/auth'));

/* ================= Server ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
