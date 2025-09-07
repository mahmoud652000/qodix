const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// خدمة الملفات الثابتة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// دوال مساعدة
function readJSON(file) {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file));
}
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ------------------ APPOINTMENT ------------------
const appointmentFile = './data/appointments.json';

app.post('/api/Appointment', upload.single('file'), (req, res) => {
    const appointments = readJSON(appointmentFile);
    const newAppointment = {
        id: Date.now(),
        ...req.body,
        file: req.file ? req.file.path : null
    };
    appointments.push(newAppointment);
    writeJSON(appointmentFile, appointments);
    res.json(newAppointment);
});

app.get('/api/Appointment', (req, res) => {
    res.json(readJSON(appointmentFile));
});

// ------------------ POST ------------------
const postFile = './data/posts.json';

app.post('/api/Post', upload.array('Photos', 10), (req, res) => {
    const posts = readJSON(postFile);
    const newPost = {
        id: Date.now(),
        Text: req.body.Text,
        Photos: req.files ? req.files.map(f => f.path) : []
    };
    posts.push(newPost);
    writeJSON(postFile, posts);
    res.json(newPost);
});

app.get('/api/Post', (req, res) => res.json(readJSON(postFile)));

app.get('/api/Post/:id', (req, res) => {
    const posts = readJSON(postFile);
    const post = posts.find(p => p.id == req.params.id);
    res.json(post || {});
});

app.put('/api/Post/:id', (req, res) => {
    const posts = readJSON(postFile);
    const idx = posts.findIndex(p => p.id == req.params.id);
    if (idx >= 0) {
        posts[idx].Text = req.body.Text;
        writeJSON(postFile, posts);
        res.json(posts[idx]);
    } else res.status(404).json({ msg: 'Not found' });
});

app.delete('/api/Post/:id', (req, res) => {
    let posts = readJSON(postFile);
    posts = posts.filter(p => p.id != req.params.id);
    writeJSON(postFile, posts);
    res.json({ msg: 'Deleted' });
});

// ------------------ PROJECT ------------------
const projectFile = './data/projects.json';

function parseUsedTech(input) {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    try {
        return JSON.parse(input);
    } catch {
        return input.split(',').map(t => t.trim());
    }
}

app.post('/api/Project', upload.single('Image'), (req, res) => {
    const projects = readJSON(projectFile);
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
    writeJSON(projectFile, projects);
    res.json(newProject);
});

app.get('/api/Project', (req, res) => res.json(readJSON(projectFile)));

app.put('/api/Project/:id', upload.single('Image'), (req, res) => {
    const projects = readJSON(projectFile);
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
        writeJSON(projectFile, projects);
        res.json(projects[idx]);
    } else res.status(404).json({ msg: 'Not found' });
});

app.delete('/api/Project/:id', (req, res) => {
    let projects = readJSON(projectFile);
    projects = projects.filter(p => p.id != req.params.id);
    writeJSON(projectFile, projects);
    res.json({ msg: 'Deleted' });
});

// ------------------ TECHNOLOGY ------------------
const techFile = './data/technologies.json';

app.post('/api/Technology', upload.single('Image'), (req, res) => {
    const techs = readJSON(techFile);
    const newTech = {
        id: Date.now(),
        TechnologyName: req.body.TechnologyName,
        Image: req.file ? req.file.path : null
    };
    techs.push(newTech);
    writeJSON(techFile, techs);
    res.json(newTech);
});

app.get('/api/Technology', (req, res) => res.json(readJSON(techFile)));

app.put('/api/Technology/:TechId', upload.single('Image'), (req, res) => {
    const techs = readJSON(techFile);
    const idx = techs.findIndex(t => t.id == req.params.TechId);
    if (idx >= 0) {
        techs[idx] = {
            ...techs[idx],
            TechnologyName: req.body.TechnologyName || techs[idx].TechnologyName,
            Image: req.file ? req.file.path : techs[idx].Image
        };
        writeJSON(techFile, techs);
        res.json(techs[idx]);
    } else res.status(404).json({ msg: 'Not found' });
});

app.delete('/api/Technology/:TechId', (req, res) => {
    let techs = readJSON(techFile);
    techs = techs.filter(t => t.id != req.params.TechId);
    writeJSON(techFile, techs);
    res.json({ msg: 'Deleted' });
});

// ------------------ START SERVER ------------------
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
// ------------------ LOGIN ------------------
const userFile = './data/users.json';

// مثال بيانات مستخدمين (ممكن تحفظها في ملف JSON)
if (!fs.existsSync(userFile)) {
  writeJSON(userFile, [
    { username: "admin", password: "1234", role: "admin" },
    { username: "user", password: "1234", role: "user" }
  ]);
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(userFile);

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  res.json({
    username: user.username,
    role: user.role
  });
});

// ------------------ TESTIMONIAL (آراء) ------------------
const testimonialFile = './data/testimonials.json';

// تأكد أن مجلد data موجود
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
if (!fs.existsSync(testimonialFile)) writeJSON(testimonialFile, []);

// إنشاء رأي جديد
app.post('/api/Testimonial', upload.single('Image'), (req, res) => {
  try {
    const testimonials = readJSON(testimonialFile);
    const newTestimonial = {
      id: Date.now(),
      Name: req.body.Name || req.body.name || '',
      JobOrCompany: req.body.JobOrCompany || req.body.Job || req.body.Company || '',
      Opinion: req.body.Opinion || req.body.opinion || '',
      Image: req.file ? req.file.path : null,
      createdAt: new Date().toISOString()
    };

    // بسيطة للتحقق من الحقول الأساسية
    if (!newTestimonial.Name || !newTestimonial.Opinion) {
      return res.status(400).json({ message: 'Name and Opinion are required.' });
    }

    testimonials.push(newTestimonial);
    writeJSON(testimonialFile, testimonials);
    res.status(201).json(newTestimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// جلب كل الآراء
app.get('/api/Testimonial', (req, res) => {
  try {
    const testimonials = readJSON(testimonialFile);
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// جلب رأي بالـ id
app.get('/api/Testimonial/:id', (req, res) => {
  const testimonials = readJSON(testimonialFile);
  const t = testimonials.find(x => x.id == req.params.id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});

// تحديث رأي (يمكن تحديث الصورة أيضاً)
app.put('/api/Testimonial/:id', upload.single('Image'), (req, res) => {
  try {
    const testimonials = readJSON(testimonialFile);
    const idx = testimonials.findIndex(x => x.id == req.params.id);
    if (idx < 0) return res.status(404).json({ message: 'Not found' });

    testimonials[idx] = {
      ...testimonials[idx],
      Name: req.body.Name !== undefined ? req.body.Name : testimonials[idx].Name,
      JobOrCompany: req.body.JobOrCompany !== undefined ? req.body.JobOrCompany : testimonials[idx].JobOrCompany,
      Opinion: req.body.Opinion !== undefined ? req.body.Opinion : testimonials[idx].Opinion,
      Image: req.file ? req.file.path : testimonials[idx].Image,
      updatedAt: new Date().toISOString()
    };

    writeJSON(testimonialFile, testimonials);
    res.json(testimonials[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// حذف رأي
app.delete('/api/Testimonial/:id', (req, res) => {
  try {
    let testimonials = readJSON(testimonialFile);
    const exists = testimonials.some(x => x.id == req.params.id);
    if (!exists) return res.status(404).json({ message: 'Not found' });

    testimonials = testimonials.filter(x => x.id != req.params.id);
    writeJSON(testimonialFile, testimonials);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

