const mongoose = require('mongoose');

const driverBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    bookingDate: Date,
    pickupLocation: String,
    dropoffLocation: String,
    status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('DriverBooking', driverBookingSchema);