const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    employeeNumber: { type: String, unique: true },
    email: { type: String, unique: true, lowercase: true },
    firstName: String,
    lastName: String,
    grade: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    isAdmin: { type: Boolean, default: false },
    isDriver: { type: Boolean, default: false },
    isApprover: { type: Boolean, default: false },
    isBayManager: { type: Boolean, default: false },
    isLineManager: { type: Boolean, default: false },
    phoneNumber: String,
    licenseNumber: String,
    status: { type: String, default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);