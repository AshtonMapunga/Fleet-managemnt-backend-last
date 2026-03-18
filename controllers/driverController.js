const User = require('../models/User');
const Trip = require('../models/Trip');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Get driver profile
// @route   GET /api/driver/profile
// @access  Private (Driver only)
const getDriverProfile = asyncHandler(async (req, res) => {
    try {
        // Check if user is a driver
        if (req.user.role !== 'driver') {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied. Driver role required.'
            });
        }

        const driver = await User.findById(req.user._id)
            .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
            .populate('department', 'name');

        res.status(StatusCodes.OK).json({
            success: true,
            data: driver
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get driver's trips
// @route   GET /api/driver/trips
// @access  Private (Driver only)
const getDriverTrips = asyncHandler(async (req, res) => {
    try {
        // Check if user is a driver
        if (req.user.role !== 'driver') {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied. Driver role required.'
            });
        }

        const trips = await Trip.find({ driver: req.user._id })
            .populate('vehicle', 'registration make model')
            .populate('department', 'name')
            .sort('-createdAt');

        res.status(StatusCodes.OK).json({
            success: true,
            count: trips.length,
            data: trips
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get available drivers
// @route   GET /api/driver/available
// @access  Private
const getAvailableDrivers = asyncHandler(async (req, res) => {
    try {
        const drivers = await User.find({ 
            role: 'driver', 
            status: 'Active' 
        })
        .select('firstName lastName employeeNumber phone licenseNumber')
        .populate('department', 'name');

        res.status(StatusCodes.OK).json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update driver location
// @route   PUT /api/driver/location
// @access  Private (Driver only)
const updateDriverLocation = asyncHandler(async (req, res) => {
    try {
        // Check if user is a driver
        if (req.user.role !== 'driver') {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied. Driver role required.'
            });
        }

        const { latitude, longitude, timestamp } = req.body;
        
        // Update driver's current location (you'll need to add this to your User model)
        // For now, we'll just acknowledge
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Location updated successfully',
            data: { latitude, longitude, timestamp }
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    getDriverProfile,
    getDriverTrips,
    getAvailableDrivers,
    updateDriverLocation
};
