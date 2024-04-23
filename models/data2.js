const mongoose = require('mongoose');

const newDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  funding: { type: String, required: true },
  investment: { type: String, required: true },
  announced: { type: String, required: true },
  filename: { type: String, required: true }
});

module.exports = mongoose.model('NewData', newDataSchema);
