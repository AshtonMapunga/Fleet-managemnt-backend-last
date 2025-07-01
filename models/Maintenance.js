const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    maintenanceType: String,
    maintenanceDate: Date,
    maintenanceCost: Number,
    description: String,
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);