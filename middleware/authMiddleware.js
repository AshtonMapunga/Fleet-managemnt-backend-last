const { verifyToken } = require('../utils/generateToken');
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
            const decoded = verifyToken(token);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'Not authorized, user not found'
                });
            }

            // Check if user changed password after token was issued
            if (req.user.changedPasswordAfter(decoded.iat)) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    message: 'User recently changed password. Please log in again.'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
});

const admin = (req, res, next) => {
    if (req.user && (req.user.isAdmin || req.user.role === 'admin')) {
        next();
    } else {
        res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized as an admin'
        });
    }
};

module.exports = { protect, admin };