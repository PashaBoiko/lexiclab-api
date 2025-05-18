const mongoose = require('mongoose');

const configScheme = new mongoose.Schema({
  configId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  }
});

const Config = mongoose.model('Dictionary', configScheme);

module.exports = Config;