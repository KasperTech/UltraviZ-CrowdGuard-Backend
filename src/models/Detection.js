// models/Detection.js
const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  cameraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camera',
    required: true
  },
  entranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrance',
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  imageSnapshot: {
    type: String
  },
  density: {
    type: Number,
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Detection', detectionSchema);