const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    employeeNumber: {
        type: String,
        required: [true, 'Employee number is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    grade: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'driver', 'manager', 'user'],
        default: 'user'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    phone: {
        type: String,
        trim: true
    },
    licenseNumber: {
        type: String,
        trim: true
    },
    licenseExpiry: {
        type: Date
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isDriver: {
        type: Boolean,
        default: false
    },
    isApprover: {
        type: Boolean,
        default: false
    },
    isBayManager: {
        type: Boolean,
        default: false
    },
    isLineManager: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    
    try {
        // Hash the password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);