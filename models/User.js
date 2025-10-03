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
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
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
        enum: ['super-admin', 'admin', 'fleet-manager', 'dispatcher', 'driver', 'viewer', 'user'],
        default: 'user'
    },
    permissions: {
        dashboard: { type: Boolean, default: false },
        userManagement: { type: Boolean, default: false },
        vehicleManagement: { type: Boolean, default: false },
        tripManagement: { type: Boolean, default: false },
        maintenanceManagement: { type: Boolean, default: false },
        fuelManagement: { type: Boolean, default: false },
        analytics: { type: Boolean, default: false },
        compliance: { type: Boolean, default: false },
        systemSettings: { type: Boolean, default: false },
        communication: { type: Boolean, default: false }
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    departmentAccess: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    subsidiaryAccess: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subsidiary'
    }],
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
    // Legacy fields for backward compatibility
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
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordChangedAt = Date.now() - 1000;
        next();
    } catch (error) {
        next(error);
    }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Method to check permissions
userSchema.methods.hasPermission = function(permission) {
    if (this.role === 'super-admin') return true;
    return this.permissions[permission] === true;
};

// Method to check department access
userSchema.methods.canAccessDepartment = function(departmentId) {
    if (this.role === 'super-admin') return true;
    if (this.departmentAccess.length === 0) return true; // No restrictions
    return this.departmentAccess.some(dept => dept.toString() === departmentId.toString());
};

// Method to check role
userSchema.methods.hasRole = function(roles) {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(this.role);
};

// Static method to get default permissions for a role
userSchema.statics.getDefaultPermissions = function(role) {
    const defaultPermissions = {
        'super-admin': {
            dashboard: true,
            userManagement: true,
            vehicleManagement: true,
            tripManagement: true,
            maintenanceManagement: true,
            fuelManagement: true,
            analytics: true,
            compliance: true,
            systemSettings: true,
            communication: true
        },
        'admin': {
            dashboard: true,
            userManagement: true,
            vehicleManagement: true,
            tripManagement: true,
            maintenanceManagement: true,
            fuelManagement: true,
            analytics: true,
            compliance: true,
            systemSettings: false,
            communication: true
        },
        'fleet-manager': {
            dashboard: true,
            userManagement: false,
            vehicleManagement: true,
            tripManagement: true,
            maintenanceManagement: true,
            fuelManagement: true,
            analytics: true,
            compliance: true,
            systemSettings: false,
            communication: true
        },
        'dispatcher': {
            dashboard: true,
            userManagement: false,
            vehicleManagement: false,
            tripManagement: true,
            maintenanceManagement: false,
            fuelManagement: false,
            analytics: false,
            compliance: false,
            systemSettings: false,
            communication: true
        },
        'driver': {
            dashboard: true,
            userManagement: false,
            vehicleManagement: false,
            tripManagement: false,
            maintenanceManagement: false,
            fuelManagement: false,
            analytics: false,
            compliance: false,
            systemSettings: false,
            communication: false
        },
        'viewer': {
            dashboard: true,
            userManagement: false,
            vehicleManagement: false,
            tripManagement: false,
            maintenanceManagement: false,
            fuelManagement: false,
            analytics: true,
            compliance: false,
            systemSettings: false,
            communication: false
        }
    };

    return defaultPermissions[role] || {};
};

module.exports = mongoose.model('User', userSchema);