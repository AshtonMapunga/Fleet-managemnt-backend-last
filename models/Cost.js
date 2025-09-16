const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Cost description is required'],
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Cost amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    category: {
        type: String,
        enum: ['fuel', 'maintenance', 'insurance', 'parking', 'tolls', 'cleaning', 'taxes', 'other'],
        required: true
    },
    dateIncurred: {
        type: Date,
        required: true,
        default: Date.now
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    receiptNumber: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank-transfer', 'company-account'],
        default: 'company-account'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cost', costSchema);