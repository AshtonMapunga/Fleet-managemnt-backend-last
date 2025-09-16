const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    registration: {
        type: String,
        required: [true, 'Registration number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    make: {
        type: String,
        required: [true, 'Make is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    color: {
        type: String,
        trim: true
    },
    vehicleType: {
        type: String,
        enum: ['car', 'truck', 'van', 'bus', 'motorcycle'],
        required: true
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'in-use', 'maintenance', 'out-of-service'],
        default: 'available'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    currentLocation: {
        type: String,
        trim: true
    },
    lastServiceDate: {
        type: Date
    },
    nextServiceDue: {
        type: Date
    },
    insuranceExpiry: {
        type: Date,
        required: true
    },
    mileage: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);