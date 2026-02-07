const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { readJSON, writeJSON } = require('../utils/jsonHelper');
const path = './data/posts.json';

// POST
router.post('/', upload.array('Photos', 10), (req, res) => {
    const posts = readJSON(path);
    const newPost = { id: Date.now(), Text: req.body.Text, Photos: req.files ? req.files.map(f => f.path) : [] };
    posts.push(newPost);
    writeJSON(path, posts);
    res.json(newPost);
});

// GET all
router.get('/', (req, res) => res.json(readJSON(path)));

// GET by id
router.get('/:id', (req, res) => {
    const posts = readJSON(path);
    const post = posts.find(p => p.id == req.params.id);
    res.json(post || {});
});

// PUT
router.put('/:id', (req, res) => {
    const posts = readJSON(path);
    const idx = posts.findIndex(p => p.id == req.params.id);
    if (idx >= 0) {
        posts[idx].Text = req.body.Text;
        writeJSON(path, posts);
        res.json(posts[idx]);
    } else res.status(404).json({ msg: 'Not found' });
});

// DELETE
router.delete('/:id', (req, res) => {
    let posts = readJSON(path);
    posts = posts.filter(p => p.id != req.params.id);
    writeJSON(path, posts);
    res.json({ msg: 'Deleted' });
});

module.exports = router;
