const mongoose = require('mongoose');

const shuttleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shuttle name is required'],
    trim: true
  },
  registration: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  route: {
    type: String,
    required: [true, 'Route is required']
  },
  schedule: [{
    departureTime: String,
    arrivalTime: String,
    days: [String] // Monday, Tuesday, etc.
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shuttle', shuttleSchema);
