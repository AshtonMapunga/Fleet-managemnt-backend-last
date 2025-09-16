const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    maintenanceType: {
        type: String,
        enum: ['routine', 'repair', 'inspection', 'accident-repair', 'other'],
        required: true
    },
    description: {
        type: String,
        required: [true, 'Maintenance description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completedDate: {
        type: Date
    },
    cost: {
        type: Number,
        min: [0, 'Cost cannot be negative'],
        required: true
    },
    serviceProvider: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    mileage: {
        type: Number,
        min: [0, 'Mileage cannot be negative']
    },
    partsReplaced: [{
        name: String,
        partNumber: String,
        cost: Number
    }],
    nextServiceDue: {
        type: Date
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);