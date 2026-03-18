const Subsidiary = require('../models/Subsidiary');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create a new subsidiary
// @route   POST /api/subsidiaries
// @access  Private/Admin
const createSubsidiary = asyncHandler(async (req, res) => {
  try {
    const subsidiary = await Subsidiary.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      data: subsidiary
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all subsidiaries
// @route   GET /api/subsidiaries
// @access  Private
const getSubsidiaries = asyncHandler(async (req, res) => {
  const subsidiaries = await Subsidiary.find();
  res.json({
    success: true,
    count: subsidiaries.length,
    data: subsidiaries
  });
});

// @desc    Get single subsidiary
// @route   GET /api/subsidiaries/:id
// @access  Private
const getSubsidiaryById = asyncHandler(async (req, res) => {
  const subsidiary = await Subsidiary.findById(req.params.id);
  
  if (!subsidiary) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: 'Subsidiary not found'
    });
  }
  
  res.json({
    success: true,
    data: subsidiary
  });
});

module.exports = {
  createSubsidiary,
  getSubsidiaries,
  getSubsidiaryById
};
