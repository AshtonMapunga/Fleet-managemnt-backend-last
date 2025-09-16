const mongoose = require('mongoose');

const subsidiarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subsidiary name is required'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Subsidiary code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
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
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    budget: {
        type: Number,
        default: 0,
        min: [0, 'Budget cannot be negative']
    },
    currentSpending: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subsidiary', subsidiarySchema);