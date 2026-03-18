const mongoose = require('mongoose');

const parkingBaySchema = new mongoose.Schema({
  bayNumber: {
    type: String,
    required: [true, 'Bay number is required'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  vehicleType: {
    type: String,
    enum: ['car', 'truck', 'bus', 'motorcycle', 'all'],
    default: 'all'
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'full', 'maintenance', 'reserved'],
    default: 'available'
  },
  features: [{
    type: String
  }],
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

module.exports = mongoose.model('ParkingBay', parkingBaySchema);
