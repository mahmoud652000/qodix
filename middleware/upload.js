const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تأكد من وجود مجلد uploads
const uploadDir = path.join(__dirname, './upload');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// إعداد multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
module.exports = upload;
