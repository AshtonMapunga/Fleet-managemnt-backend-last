const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accidentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    location: {
        type: String,
        required: [true, 'Accident location is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Accident description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'total-loss'],
        required: true
    },
    injuries: {
        type: String,
        enum: ['none', 'minor', 'major', 'fatal'],
        default: 'none'
    },
    policeReportNumber: {
        type: String,
        trim: true
    },
    estimatedDamageCost: {
        type: Number,
        min: [0, 'Damage cost cannot be negative']
    },
    actualDamageCost: {
        type: Number,
        min: [0, 'Damage cost cannot be negative']
    },
    insuranceClaimNumber: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['reported', 'under-investigation', 'resolved', 'insurance-claim'],
        default: 'reported'
    },
    images: [{
        url: String,
        description: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Accident', accidentSchema);