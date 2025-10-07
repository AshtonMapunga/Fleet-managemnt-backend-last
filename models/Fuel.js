const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required']
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fuelingDate: {
        type: Date,
        required: [true, 'Fueling date is required'],
        default: Date.now
    },
    odometerReading: {
        type: Number,
        required: [true, 'Odometer reading is required'],
        min: [0, 'Odometer cannot be negative']
    },
    fuelAmount: {
        type: Number,
        required: [true, 'Fuel amount is required'],
        min: [0, 'Fuel amount cannot be negative']
    },
    fuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
        required: [true, 'Fuel type is required']
    },
    costPerUnit: {
        type: Number,
        required: [true, 'Cost per unit is required'],
        min: [0, 'Cost cannot be negative']
    },
    totalCost: {
        type: Number,
        min: [0, 'Total cost cannot be negative']
        // REMOVE required: true - it will be calculated automatically
    },
    fuelingLocation: {
        type: String,
        required: [true, 'Fueling location is required'],
        trim: true
    },
    fuelCardNumber: {
        type: String,
        trim: true
    },
    receiptNumber: {
        type: String,
        trim: true
    },
    receiptImage: {
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    fuelingType: {
        type: String,
        enum: ['full', 'partial', 'emergency', 'routine'],
        default: 'full'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
        // REMOVE required: true to make it optional
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Calculate total cost before saving
fuelSchema.pre('save', function(next) {
    // Calculate total cost automatically
    this.totalCost = this.fuelAmount * this.costPerUnit;
    next();
});

module.exports = mongoose.model('Fuel', fuelSchema);