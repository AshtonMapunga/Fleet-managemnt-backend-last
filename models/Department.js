const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Department code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [0, 'Budget cannot be negative']
    },
    currentSpending: {
        type: Number,
        default: 0
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

// Update current spending when costs are added
departmentSchema.methods.updateSpending = function(amount) {
    this.currentSpending += amount;
    return this.save();
};

module.exports = mongoose.model('Department', departmentSchema);