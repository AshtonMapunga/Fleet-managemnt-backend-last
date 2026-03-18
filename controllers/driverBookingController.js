const DriverBooking = require('../models/DriverBooking');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create a new driver booking
// @route   POST /api/driver-booking/create
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    try {
        const bookingData = {
            ...req.body,
            createdBy: req.user._id
        };
        
        const booking = await DriverBooking.create(bookingData);
        
        res.status(StatusCodes.CREATED).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all bookings
// @route   GET /api/driver-booking
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
    try {
        const { status, driverId, startDate } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (driverId) query.driverId = driverId;
        if (startDate) query.scheduledPickupTime = { $gte: new Date(startDate) };
        
        const bookings = await DriverBooking.find(query)
            .populate('driverId', 'firstName lastName employeeNumber')
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName')
            .sort('-createdAt');
        
        res.status(StatusCodes.OK).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get booking by ID
// @route   GET /api/driver-booking/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
    try {
        const booking = await DriverBooking.findById(req.params.id)
            .populate('driverId', 'firstName lastName employeeNumber')
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');
        
        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(StatusCodes.OK).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update booking status
// @route   PUT /api/driver-booking/:id/status
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        
        const booking = await DriverBooking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!booking) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.status(StatusCodes.OK).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get bookings by driver
// @route   GET /api/driver-booking/driver/:driverId
// @access  Private
const getBookingsByDriver = asyncHandler(async (req, res) => {
    try {
        const bookings = await DriverBooking.find({ driverId: req.params.driverId })
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name')
            .sort('-scheduledPickupTime');
        
        res.status(StatusCodes.OK).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get bookings by vehicle
// @route   GET /api/driver-booking/vehicle/:vehicleId
// @access  Private
const getBookingsByVehicle = asyncHandler(async (req, res) => {
    try {
        const bookings = await DriverBooking.find({ vehicleId: req.params.vehicleId })
            .populate('driverId', 'firstName lastName')
            .populate('department', 'name')
            .sort('-scheduledPickupTime');
        
        res.status(StatusCodes.OK).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    getBookingsByDriver,
    getBookingsByVehicle
};
