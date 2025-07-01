const Accident = require('../models/Accident');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Record accident
// @route   POST /api/accidents/createAccident
// @access  Private
const recordAccident = asyncHandler(async (req, res) => {
    const { requestId, accidentDate, accidentLocation, accidentDescription, accidentDamage, status, driver } = req.body;

    const accident = await Accident.create({
        requestId,
        accidentDate,
        accidentLocation,
        accidentDescription,
        accidentDamage,
        status,
        driver
    });

    res.status(StatusCodes.CREATED).json(accident);
});

// @desc    Get all accidents
// @route   GET /api/accidents/allAccidents
// @access  Private
const getAllAccidents = asyncHandler(async (req, res) => {
    const accidents = await Accident.find({})
        .populate('requestId')
        .populate('driver', 'firstName lastName');

    res.status(StatusCodes.OK).json(accidents);
});

module.exports = {
    recordAccident,
    getAllAccidents,
};