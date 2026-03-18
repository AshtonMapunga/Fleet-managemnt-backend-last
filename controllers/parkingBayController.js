const ParkingBay = require('../models/ParkingBay');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create a new parking bay
// @route   POST /api/parking-bays
// @access  Private
const createParkingBay = asyncHandler(async (req, res) => {
  try {
    const parkingBay = await ParkingBay.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: parkingBay
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all parking bays
// @route   GET /api/parking-bays
// @access  Private
const getParkingBays = asyncHandler(async (req, res) => {
  const parkingBays = await ParkingBay.find()
    .populate('department', 'name');
  res.json({
    success: true,
    count: parkingBays.length,
    data: parkingBays
  });
});

// @desc    Get parking bay by ID
// @route   GET /api/parking-bays/:id
// @access  Private
const getParkingBayById = asyncHandler(async (req, res) => {
  const parkingBay = await ParkingBay.findById(req.params.id)
    .populate('department', 'name');
  
  if (!parkingBay) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Parking bay not found'
    });
  }
  
  res.json({
    success: true,
    data: parkingBay
  });
});

// @desc    Update parking bay
// @route   PUT /api/parking-bays/:id
// @access  Private
const updateParkingBay = asyncHandler(async (req, res) => {
  const parkingBay = await ParkingBay.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!parkingBay) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Parking bay not found'
    });
  }
  
  res.json({
    success: true,
    data: parkingBay
  });
});

// @desc    Update occupancy
// @route   PATCH /api/parking-bays/:id/occupancy
// @access  Private
const updateOccupancy = asyncHandler(async (req, res) => {
  const { currentOccupancy } = req.body;
  const parkingBay = await ParkingBay.findById(req.params.id);
  
  if (!parkingBay) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Parking bay not found'
    });
  }
  
  parkingBay.currentOccupancy = currentOccupancy;
  parkingBay.status = currentOccupancy >= parkingBay.capacity ? 'full' : 'available';
  await parkingBay.save();
  
  res.json({
    success: true,
    data: parkingBay
  });
});

module.exports = {
  createParkingBay,
  getParkingBays,
  getParkingBayById,
  updateParkingBay,
  updateOccupancy
};
