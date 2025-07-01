const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverBooking' },
    accidentDate: Date,
    accidentLocation: String,
    accidentDescription: String,
    accidentDamage: String,
    status: String,
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Accident', accidentSchema);