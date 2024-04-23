const mongoose = require('mongoose');

const newDataSchema = new mongoose.Schema({
    
  filename: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model('NewData2', newDataSchema);
