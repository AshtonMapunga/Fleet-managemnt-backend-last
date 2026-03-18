const Shuttle = require('../models/Shuttle');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create a new shuttle
// @route   POST /api/shuttles
// @access  Private
const createShuttle = asyncHandler(async (req, res) => {
  try {
    const shuttle = await Shuttle.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: shuttle
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all shuttles
// @route   GET /api/shuttles
// @access  Private
const getShuttles = asyncHandler(async (req, res) => {
  const shuttles = await Shuttle.find()
    .populate('driver', 'firstName lastName')
    .populate('department', 'name');
  res.json({
    success: true,
    count: shuttles.length,
    data: shuttles
  });
});

// @desc    Get shuttle by ID
// @route   GET /api/shuttles/:id
// @access  Private
const getShuttleById = asyncHandler(async (req, res) => {
  const shuttle = await Shuttle.findById(req.params.id)
    .populate('driver', 'firstName lastName')
    .populate('department', 'name');
  
  if (!shuttle) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Shuttle not found'
    });
  }
  
  res.json({
    success: true,
    data: shuttle
  });
});

// @desc    Update shuttle
// @route   PUT /api/shuttles/:id
// @access  Private
const updateShuttle = asyncHandler(async (req, res) => {
  const shuttle = await Shuttle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!shuttle) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Shuttle not found'
    });
  }
  
  res.json({
    success: true,
    data: shuttle
  });
});

// @desc    Delete shuttle
// @route   DELETE /api/shuttles/:id
// @access  Private/Admin
const deleteShuttle = asyncHandler(async (req, res) => {
  const shuttle = await Shuttle.findByIdAndDelete(req.params.id);
  
  if (!shuttle) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Shuttle not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Shuttle deleted successfully'
  });
});

module.exports = {
  createShuttle,
  getShuttles,
  getShuttleById,
  updateShuttle,
  deleteShuttle
};
