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
        uppercase: true
    },
    make: {
        type: String,
        required: [true, 'Make is required']
    },
    model: {
        type: String,
        required: [true, 'Model is required']
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    capacity: {
        type: Number,
        required: [true, 'Passenger capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid'],
        required: true
    },
    insuranceExpiry: {
        type: Date,
        required: true
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