// models/Entrance.js
const mongoose = require('mongoose');

const entranceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200
  },
  thresholdMedium: {
    type: Number,
  },
  thresholdHigh: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Entrance', entranceSchema);