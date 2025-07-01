const Vehicle = require('../models/Vehicle');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Add new vehicle
// @route   POST /api/vehicle/create
// @access  Private
const addNewVehicle = asyncHandler(async (req, res) => {
    const { vehicleDetails, licenseDetails } = req.body;

    const vehicle = await Vehicle.create({
        ...vehicleDetails,
        licenseDetails
    });

    res.status(StatusCodes.CREATED).json(vehicle);
});

// @desc    Get all vehicles
// @route   GET /api/vehicle/getVehicles
// @access  Private
const getAllVehicles = asyncHandler(async (req, res) => {
    const { mode } = req.query;

    let query = {};
    if (mode === 'client') {
        query.vehicleStatus = { $in: ['AVAILABLE', 'IN_USE'] };
    }

    const vehicles = await Vehicle.find(query);
    res.status(StatusCodes.OK).json(vehicles);
});

// @desc    Get all vehicles with location and driver info
// @route   GET /api/vehicle/vehicles-with-location
// @access  Private
const getAllVehiclesWithLocation = asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.find({})
        .populate('driverId', 'firstName lastName')
        .select('vehicleReg currentLocation make model colour');

    res.status(StatusCodes.OK).json(vehicles);
});

// @desc    Get vehicle with location and driver info
// @route   GET /api/vehicle/vehicle-with-location/:vehicleReg
// @access  Private
const getVehicleWithLocation = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findOne({ vehicleReg: req.params.vehicleReg })
        .populate('driverId', 'firstName lastName')
        .select('vehicleReg currentLocation make model colour');

    if (!vehicle) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Vehicle not found');
    }

    res.status(StatusCodes.OK).json(vehicle);
});

// @desc    Get vehicles by department
// @route   GET /api/vehicle/getVehiclesByDepartment
// @access  Private
const getVehiclesByDepartment = asyncHandler(async (req, res) => {
    const { department } = req.query;

    const vehicles = await Vehicle.find({ department });
    res.status(StatusCodes.OK).json(vehicles);
});

// @desc    Get vehicle by registration
// @route   GET /api/vehicle
// @access  Private
const getVehicleByRegistration = asyncHandler(async (req, res) => {
    const { vehicleReg } = req.query;

    const vehicle = await Vehicle.findOne({ vehicleReg });
    if (!vehicle) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Vehicle not found');
    }

    res.status(StatusCodes.OK).json(vehicle);
});

// @desc    Update vehicle details
// @route   PUT /api/vehicle/update-details/:vehicleReg
// @access  Private
const updateVehicleDetails = asyncHandler(async (req, res) => {
    const { vehicleReg } = req.params;
    const updateData = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
        { vehicleReg },
        updateData,
        { new: true, runValidators: true }
    );

    if (!vehicle) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Vehicle not found');
    }

    res.status(StatusCodes.OK).json(vehicle);
});

// @desc    Batch add vehicles from Cartrack
// @route   POST /api/vehicle/cartrack/batch-create-vehicles
// @access  Private
const batchAddVehiclesFromCartrack = asyncHandler(async (req, res) => {
    const { vehicles } = req.body;

    const createdVehicles = await Vehicle.insertMany(vehicles.map(v => ({
        vehicleReg: v.registration,
        make: v.manufacturer,
        model: v.model,
        colour: v.colour,
        chasisNumber: v.chassis_number,
        vehicleStatus: 'AVAILABLE'
    })));

    res.status(StatusCodes.CREATED).json(createdVehicles);
});

// @desc    Update vehicle tracking details
// @route   PUT /api/vehicle/update-tracking/:vehicleReg
// @access  Private
const updateVehicleTracking = asyncHandler(async (req, res) => {
  const { vehicleReg } = req.params;
  const trackingDetails = req.body;
  
  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleReg },
    { trackingDetails },
    { new: true, runValidators: true }
  );
  
  if (!vehicle) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error('Vehicle not found');
  }
  
  res.status(StatusCodes.OK).json(vehicle);
});

// @desc    Get vehicles by status
// @route   GET /api/vehicle/status/:status
// @access  Private
const getVehiclesByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const validStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISPOSED'];
  
  if (!validStatuses.includes(status.toUpperCase())) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error('Invalid status specified');
  }
  
  const vehicles = await Vehicle.find({ vehicleStatus: status.toUpperCase() });
  res.status(StatusCodes.OK).json(vehicles);
});

module.exports = {
    addNewVehicle,
    getAllVehicles,
    getAllVehiclesWithLocation,
    getVehicleWithLocation,
    getVehiclesByDepartment,
    getVehicleByRegistration,
    updateVehicleDetails,
    batchAddVehiclesFromCartrack,
    updateVehicleTracking,
    getVehiclesByStatus
};