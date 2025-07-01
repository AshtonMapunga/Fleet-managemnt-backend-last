const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    departmentName: String,
    departmentDescription: String,
    departmentHead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    allocatedFunds: Number,
    availableFunds: Number,
    subsidiary: { type: mongoose.Schema.Types.ObjectId, ref: 'Subsidiary' },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);