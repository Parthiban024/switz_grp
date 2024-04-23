const mongoose = require('mongoose');

const newDataSchemaTwo = new mongoose.Schema({
  productNews: { type: String, required: true },
  innovation: { type: String, required: true }
});

module.exports = mongoose.model('NewDataThree', newDataSchemaTwo);
