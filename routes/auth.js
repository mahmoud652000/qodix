const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const userFile = './data/users.json';

// إذا الملف غير موجود
const fs = require('fs');
if (!fs.existsSync(userFile)) {
    writeJSON(userFile, [
        { username: "admin", password: "1234", role: "admin" },
        { username: "user", password: "1234", role: "user" }
    ]);
}

// LOGIN
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(userFile);
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(401).json({ message: 'Invalid username or password' });
    res.json({ username: user.username, role: user.role });
});

module.exports = router;
