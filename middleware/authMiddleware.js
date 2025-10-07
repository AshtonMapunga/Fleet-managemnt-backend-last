const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authorized, user not found'
                });
            }

            // Check if user changed password after token was issued
            if (req.user.changedPasswordAfter && req.user.changedPasswordAfter(decoded.iat)) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User recently changed password. Please log in again.'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
});

const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'super-admin')) {
        next();
    } else {
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized as an admin'
        });
    }
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        if (req.user && req.user.hasPermission && req.user.hasPermission(permission)) {
            next();
        } else {
            res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: `Insufficient permissions. Required: ${permission}`
            });
        }
    };
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userRoles = Array.isArray(roles) ? roles : [roles];
        if (userRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: `Insufficient role. Required: ${userRoles.join(', ')}`
            });
        }
    };
};

const requireDepartmentAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // If no department ID in request, proceed
    if (!req.params.departmentId && !req.body.department && !req.query.departmentId) {
        return next();
    }

    const departmentId = req.params.departmentId || req.body.department || req.query.departmentId;
    
    if (req.user.canAccessDepartment && req.user.canAccessDepartment(departmentId)) {
        next();
    } else {
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Access denied for this department'
        });
    }
};

module.exports = { 
    protect, 
    admin, 
    requirePermission, 
    requireRole,
    requireDepartmentAccess 
};