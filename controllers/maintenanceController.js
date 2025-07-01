const Maintenance = require('../models/Maintenance');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Record maintenance
// @route   POST /api/maintenance/create
// @access  Private
const recordMaintenance = asyncHandler(async (req, res) => {
    const { vehicleId, maintenanceType, maintenanceDate, maintenanceCost, description } = req.body;

    const maintenance = await Maintenance.create({
        vehicleId,
        maintenanceType,
        maintenanceDate,
        maintenanceCost,
        description
    });

    res.status(StatusCodes.CREATED).json(maintenance);
});

// @desc    Get all maintenance records
// @route   GET /api/maintenance
// @access  Private
const getAllMaintenance = asyncHandler(async (req, res) => {
    const maintenance = await Maintenance.find({})
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(maintenance);
});

// @desc    Get maintenance by vehicle ID
// @route   GET /api/maintenance/vehicle
// @access  Private
const getMaintenanceByVehicleId = asyncHandler(async (req, res) => {
    const { vehicleId } = req.query;

    const maintenance = await Maintenance.find({ vehicleId })
        .populate('vehicleId', 'vehicleReg make model');

    res.status(StatusCodes.OK).json(maintenance);
});

// @desc    Edit maintenance record
// @route   PUT /api/maintenance/editMaintenance
// @access  Private
const editMaintenance = asyncHandler(async (req, res) => {
    const { maintenanceId } = req.query;
    const updateData = req.body;

    const maintenance = await Maintenance.findByIdAndUpdate(
        maintenanceId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!maintenance) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Maintenance record not found');
    }

    res.status(StatusCodes.OK).json(maintenance);
});

module.exports = {
    recordMaintenance,
    getAllMaintenance,
    getMaintenanceByVehicleId,
    editMaintenance,
};