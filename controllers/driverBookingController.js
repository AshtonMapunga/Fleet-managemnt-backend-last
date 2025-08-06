const DriverBooking = require('../models/DriverBooking');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Book a driver
// @route   POST /api/driver-booking/create
// @access  Private
const bookADriver = asyncHandler(async (req, res) => {
    const { userId, driverId, vehicleId, bookingDate, pickupLocation, dropoffLocation } = req.body;

    const booking = await DriverBooking.create({
        userId,
        driverId,
        vehicleId,
        bookingDate,
        pickupLocation,
        dropoffLocation
    });

    res.status(StatusCodes.CREATED).json(booking);
});

// @desc    Get all driver bookings
// @route   GET /api/driver-booking/getAllDriverBookings
// @access  Private
const getAllDriverBookings = asyncHandler(async (req, res) => {
    const { requester } = req.query;

    let query = {};
    if (requester) {
        query.userId = requester;
    }

    const bookings = await DriverBooking.find(query)
        .populate('userId', 'firstName lastName')
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(bookings);
});

// @desc    Get driver bookings by driver ID
// @route   GET /api/driver-booking/getBookingsByDriver
// @access  Private
const getDriverBookingsById = asyncHandler(async (req, res) => {
  // Use req.params.id instead of req.query.driverId
  const bookings = await DriverBooking.find({ 
    driverId: req.params.id  // Changed from req.query.driverId
  })
  .populate('userId vehicleId', 'firstName lastName vehicleReg make')
  .lean();

  if (!bookings.length) {
    return res.status(200).json([]); // Explicit empty array
  }

  res.status(200).json(bookings);
});

// @desc    Get driver requests
// @route   GET /api/vehicle-request/getDriverRequests
// @access  Private
const getDriverRequests = asyncHandler(async (req, res) => {
    const { driver } = req.query;

    const requests = await DriverBooking.find({ driverId: driver, status: 'Pending' })
        .populate('userId', 'firstName lastName')
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(requests);
});
// @desc    Get single driver booking by ID
// @route   GET /api/driver-booking/:id
// @access  Private
const getDriverBookingById = asyncHandler(async (req, res) => {
    const booking = await DriverBooking.findById(req.params.id)
        .populate('userId', 'firstName lastName')
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'vehicleReg make model');

    if (!booking) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Driver booking not found');
    }

    res.status(StatusCodes.OK).json(booking);
});

// Add to exports
module.exports = {
    bookADriver,
    getAllDriverBookings,
    getDriverBookingsById,
    getDriverRequests,
    getDriverBookingById // Add this line
};

module.exports = {
    bookADriver,
    getAllDriverBookings,
    getDriverBookingsById,
    getDriverRequests,
    getDriverBookingById // Add this line
};