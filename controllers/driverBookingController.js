const DriverBooking = require('../models/DriverBooking');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Book a driver
// @route   POST /api/driver-booking/create
// @access  Private
const bookADriver = asyncHandler(async (req, res) => {
    const { driverId, vehicleId, passengerName, passengerContact, pickupLocation, destination, scheduledPickupTime, department, createdBy } = req.body;

    const booking = await DriverBooking.create({
        driverId,
        vehicleId,
        passengerName,
        passengerContact,
        pickupLocation,
        destination,
        scheduledPickupTime,
        department,
        createdBy
    });

    res.status(StatusCodes.CREATED).json(booking);
});

// @desc    Get all driver bookings
// @route   GET /api/driver-booking/getAllDriverBookings
// @access  Private
const getAllDriverBookings = asyncHandler(async (req, res) => {
    const bookings = await DriverBooking.find()
        .populate('createdBy', 'firstName lastName')  // CHANGED from userId to createdBy
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(bookings);
});

// @desc    Get driver bookings by driver ID
// @route   GET /api/driver-booking/getBookingsByDriver
// @access  Private
const getDriverBookingsById = asyncHandler(async (req, res) => {
    const bookings = await DriverBooking.find({ 
        driverId: req.params.id
    })
    .populate('createdBy', 'firstName lastName')  // CHANGED from userId to createdBy
    .populate('vehicleId', 'vehicleReg make');

    res.status(StatusCodes.OK).json(bookings);
});

// @desc    Get driver requests
// @route   GET /api/driver-booking/getDriverRequests
// @access  Private
const getDriverRequests = asyncHandler(async (req, res) => {
    const { driver } = req.query;

    const requests = await DriverBooking.find({ driverId: driver, status: 'Pending' })
        .populate('createdBy', 'firstName lastName')  // CHANGED from userId to createdBy
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(requests);
});

// @desc    Get single driver booking by ID
// @route   GET /api/driver-booking/:id
// @access  Private
const getDriverBookingById = asyncHandler(async (req, res) => {
    const booking = await DriverBooking.findById(req.params.id)
        .populate('createdBy', 'firstName lastName')  // CHANGED from userId to createdBy
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'vehicleReg make model');

    if (!booking) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Driver booking not found');
    }

    res.status(StatusCodes.OK).json(booking);
});

module.exports = {
    bookADriver,
    getAllDriverBookings,
    getDriverBookingsById,
    getDriverRequests,
    getDriverBookingById
};