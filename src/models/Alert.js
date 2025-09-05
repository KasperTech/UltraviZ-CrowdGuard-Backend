// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  entranceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrance',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Detection',
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


// Pre-save middleware to set resolvedAt
alertSchema.pre('save', function (next) {
  if (this.isModified('isResolved') && this.isResolved && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Alert', alertSchema);