const mongoose = require('mongoose');

const driverBookingSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    passengerName: {
        type: String,
        required: [true, 'Passenger name is required'],
        trim: true
    },
    passengerContact: {
        type: String,
        required: [true, 'Passenger contact is required'],
        trim: true
    },
    pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required'],
        trim: true
    },
    destination: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true
    },
    scheduledPickupTime: {
        type: Date,
        required: true
    },
    scheduledReturnTime: {
        type: Date
    },
    actualPickupTime: {
        type: Date
    },
    actualReturnTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    purpose: {
        type: String,
        trim: true
    },
    estimatedCost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
    },
    actualCost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
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

module.exports = mongoose.model('DriverBooking', driverBookingSchema);