const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true
    },
    departmentDescription: {
        type: String,
        trim: true
    },
    departmentHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    allocatedFunds: {
        type: Number,
        default: 0,
        min: [0, 'Allocated funds cannot be negative']
    },
    availableFunds: {
        type: Number,
        default: 0,
        min: [0, 'Available funds cannot be negative']
    },
    subsidiary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subsidiary'
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Update available funds when costs are deducted
departmentSchema.methods.deductFunds = function(amount) {
    if (this.availableFunds < amount) {
        throw new Error('Insufficient funds');
    }
    this.availableFunds -= amount;
    return this.save();
};

module.exports = mongoose.model('Department', departmentSchema);