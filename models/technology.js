const mongoose = require('mongoose');

const technologySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String }
});

module.exports = mongoose.model('Technology', technologySchema);
