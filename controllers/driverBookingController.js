const DriverBooking = require('../models/DriverBooking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const emailService = require('../services/emailService');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Book a driver
// @route   POST /api/driver-booking/create
// @access  Private
const bookADriver = asyncHandler(async (req, res) => {
    try {
        const { driverId, vehicleId, passengerName, passengerContact, pickupLocation, destination, scheduledPickupTime, department, createdBy, purpose } = req.body;

        // Create booking
        const booking = await DriverBooking.create({
            driverId,
            vehicleId,
            passengerName,
            passengerContact,
            pickupLocation,
            destination,
            scheduledPickupTime,
            department,
            createdBy,
            purpose: purpose || ''
        });

        // Get driver and vehicle details for email
        const driver = await User.findById(driverId).select('email firstName lastName');
        const vehicle = await Vehicle.findById(vehicleId).select('make model registration');

        // Send email notification to driver
        if (driver && driver.email) {
            try {
                await emailService.sendDriverBookingEmail(
                    driver.email,
                    {
                        passengerName,
                        passengerContact,
                        pickupLocation,
                        destination,
                        scheduledPickupTime,
                        purpose: purpose || '',
                        vehicleMake: vehicle?.make || 'Unknown',
                        vehicleModel: vehicle?.model || 'Unknown',
                        vehicleRegistration: vehicle?.registration || 'Unknown',
                        driverName: `${driver.firstName} ${driver.lastName}`
                    }
                );
                
                console.log('✅ Email notification sent to driver:', driver.email);
            } catch (emailError) {
                console.error('❌ Failed to send email notification:', emailError);
                // Don't fail the booking if email fails
            }
        }

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: driver ? 'Driver booked successfully and notification sent' : 'Driver booked successfully',
            data: booking
        });

    } catch (error) {
        console.error('❌ Booking error:', error);
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all driver bookings
// @route   GET /api/driver-booking/getAllDriverBookings
// @access  Private
const getAllDriverBookings = asyncHandler(async (req, res) => {
    const bookings = await DriverBooking.find()
        .populate('createdBy', 'firstName lastName')
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
    .populate('createdBy', 'firstName lastName')
    .populate('vehicleId', 'vehicleReg make');

    res.status(StatusCodes.OK).json(bookings);
});

// @desc    Get driver requests
// @route   GET /api/driver-booking/getDriverRequests
// @access  Private
const getDriverRequests = asyncHandler(async (req, res) => {
    const { driver } = req.query;

    const requests = await DriverBooking.find({ driverId: driver, status: 'Pending' })
        .populate('createdBy', 'firstName lastName')
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(requests);
});

// @desc    Get single driver booking by ID
// @route   GET /api/driver-booking/:id
// @access  Private
const getDriverBookingById = asyncHandler(async (req, res) => {
    const booking = await DriverBooking.findById(req.params.id)
        .populate('createdBy', 'firstName lastName')
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