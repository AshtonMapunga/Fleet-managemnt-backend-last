const Subsidiary = require('../models/Subsidiary');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create subsidiary
// @route   POST /api/subsidiary/create-subsidiary
// @access  Private
const createSubsidiary = asyncHandler(async (req, res) => {
    const { subsidiaryName, subsidiaryDescription } = req.body;

    const subsidiary = await Subsidiary.create({
        subsidiaryName,
        subsidiaryDescription
    });

    res.status(StatusCodes.CREATED).json(subsidiary);
});

module.exports = {
    createSubsidiary,
};