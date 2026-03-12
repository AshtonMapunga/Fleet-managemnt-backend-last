const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    tripNumber: {
        type: String,
        required: true,
        unique: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    startLocation: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    route: {
        type: String
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    distance: {
        type: Number,
        default: 0
    },
    fuelUsed: {
        type: Number,
        default: 0
    },
    documents: [{
        type: {
            type: String,
            enum: ['delivery-note', 'receipt', 'proof-of-delivery', 'other']
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    issues: [{
        type: {
            type: String,
            enum: ['breakdown', 'mechanical', 'accident', 'delay', 'other']
        },
        description: String,
        reportedAt: {
            type: Date,
            default: Date.now
        },
        resolved: {
            type: Boolean,
            default: false
        }
    }],
    gpsLocations: [{
        lat: Number,
        lng: Number,
        timestamp: {
            type: Date,
            default: Date.now
        },
        speed: Number
    }],
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }
}, {
    timestamps: true
});

// Generate trip number before saving
tripSchema.pre('save', async function(next) {
    if (!this.tripNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.tripNumber = `TRIP-${year}${month}${day}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Trip', tripSchema);
