const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  filename1: { type: String, required: true }, // First image filename
  filename2: { type: String, required: true } // Second image filename
});

module.exports = mongoose.model('Data', dataSchema);
