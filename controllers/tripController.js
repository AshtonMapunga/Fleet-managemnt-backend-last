const Trip = require('../models/Trip');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = asyncHandler(async (req, res) => {
  try {
    const trip = await Trip.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: trip
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find()
    .populate('driver', 'firstName lastName')
    .populate('vehicle', 'registration make model')
    .populate('department', 'name');
  res.json({
    success: true,
    count: trips.length,
    data: trips
  });
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTripById = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('driver', 'firstName lastName')
    .populate('vehicle', 'registration make model')
    .populate('department', 'name');
  
  if (!trip) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  res.json({
    success: true,
    data: trip
  });
});

// @desc    Update trip status
// @route   PUT /api/trips/:id/status
// @access  Private
const updateTripStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const trip = await Trip.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  
  if (!trip) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Trip not found'
    });
  }
  
  res.json({
    success: true,
    data: trip
  });
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTripStatus
};
