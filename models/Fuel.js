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
        required: [true, 'Total cost is required'],
        min: [0, 'Total cost cannot be negative']
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
        ref: 'Department',
        required: true
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
    if (this.isModified('fuelAmount') || this.isModified('costPerUnit')) {
        this.totalCost = this.fuelAmount * this.costPerUnit;
    }
    next();
});

// Index for better query performance
fuelSchema.index({ vehicleId: 1, fuelingDate: 1 });
fuelSchema.index({ fuelingDate: 1 });
fuelSchema.index({ department: 1 });

// In your Fuel model, find the static method and update it:

// Static method for fuel efficiency calculation
fuelSchema.statics.calculateFuelEfficiency = async function(vehicleId, startDate, endDate) {
    const fuelData = await this.aggregate([
        {
            $match: {
                vehicleId: new mongoose.Types.ObjectId(vehicleId), // FIXED: Added 'new'
                fuelingDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: '$vehicleId',
                totalFuel: { $sum: '$fuelAmount' },
                totalCost: { $sum: '$totalCost' },
                firstOdometer: { $min: '$odometerReading' },
                lastOdometer: { $max: '$odometerReading' },
                fuelEntries: { $sum: 1 }
            }
        }
    ]);

    if (fuelData.length === 0) return null;

    const data = fuelData[0];
    const distance = data.lastOdometer - data.firstOdometer;
    const fuelEfficiency = distance > 0 ? (data.totalFuel / distance) * 100 : 0; // liters per 100km

    return {
        vehicleId,
        period: { startDate, endDate },
        totalFuel: data.totalFuel,
        totalCost: data.totalCost,
        distanceTraveled: distance,
        fuelEfficiency: fuelEfficiency,
        costPerKm: distance > 0 ? data.totalCost / distance : 0,
        fuelEntries: data.fuelEntries
    };
};

module.exports = mongoose.model('Fuel', fuelSchema);