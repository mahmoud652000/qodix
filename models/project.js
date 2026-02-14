const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  Name: { type: String, required: true },           // اسم المشروع
  Description: { type: String },                   // وصف المشروع
  ProjectType: { type: String, default: "web" },  // نوع المشروع: web, flutter, design
  UsedTechnology: { type: [String], default: [] }, // التقنيات المستخدمة
  ProjectLink: { type: String },                   // رابط المشروع
  Image: { type: String },                         // اسم صورة المشروع
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
