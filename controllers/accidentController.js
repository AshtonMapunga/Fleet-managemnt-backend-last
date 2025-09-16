const Accident = require('../models/Accident');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Record accident
// @route   POST /api/accidents/createAccident
// @access  Private
const recordAccident = asyncHandler(async (req, res) => {
    const { vehicleId, driverId, location, description, severity, department, reportedBy } = req.body;

    const accident = await Accident.create({
        vehicleId,
        driverId,
        location,
        description,
        severity,
        department,
        reportedBy
    });

    res.status(StatusCodes.CREATED).json(accident);
});

// @desc    Get all accidents
// @route   GET /api/accidents/allAccidents
// @access  Private
const getAllAccidents = asyncHandler(async (req, res) => {
    const accidents = await Accident.find({})
        .populate('vehicleId', 'vehicleReg make model')
        .populate('driverId', 'firstName lastName')
        .populate('reportedBy', 'firstName lastName');

    res.status(StatusCodes.OK).json(accidents);
});

module.exports = {
    recordAccident,
    getAllAccidents,
};