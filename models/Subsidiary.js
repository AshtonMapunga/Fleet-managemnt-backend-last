const mongoose = require('mongoose');

const subsidiarySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subsidiary name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Subsidiary code is required'],
        unique: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    contactEmail: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subsidiary', subsidiarySchema);