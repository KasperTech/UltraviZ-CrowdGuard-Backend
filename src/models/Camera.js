// models/Camera.js
const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
  entranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrance',
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  streamUrl: {
    type: String,
  },
  roi: {
    x: { type: Number, },
    y: { type: Number, },
    width: { type: Number,},
    height: { type: Number }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
  },
  location: {
    type: {
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      }
    }
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Camera', cameraSchema);