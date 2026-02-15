const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  Name: { type: String, required: true },                 // اسم المشروع
  Description: { type: String, required: true },         // وصف المشروع
  ProjectType: { type: String, enum: ['web', 'flutter', 'design'], default: "web" },  // نوع المشروع
  UsedTechnology: { type: [String], default: [] },       // التقنيات المستخدمة
  ProjectLink: { 
    type: String,
    validate: {
      validator: function(v) { return !v || /^https?:\/\/.+$/.test(v); },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  Image: { type: String },                               // مسار صورة المشروع
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
