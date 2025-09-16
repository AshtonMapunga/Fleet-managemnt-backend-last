const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    shuttleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shuttle'
    },
    parkingLocation: {
        type: String,
        required: [true, 'Parking location is required'],
        trim: true
    },
    parkingType: {
        type: String,
        enum: ['daily', 'monthly', 'event', 'reserved', 'temporary'],
        default: 'daily'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    durationHours: {
        type: Number,
        min: [0, 'Duration cannot be negative']
    },
    cost: {
        amount: {
            type: Number,
            min: [0, 'Cost cannot be negative'],
            default: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid', 'pending', 'waived'],
        default: 'unpaid'
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Pre-save to calculate duration
parkingSchema.pre('save', function(next) {
    if (this.endTime && this.startTime) {
        this.durationHours = (this.endTime - this.startTime) / (1000 * 60 * 60);
    }
    next();
});

module.exports = mongoose.model('Parking', parkingSchema);