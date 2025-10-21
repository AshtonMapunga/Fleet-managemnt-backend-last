const Vehicle = require('../models/Vehicle');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Add new vehicle
// @route   POST /api/vehicle/create
// @access  Private
const addNewVehicle = asyncHandler(async (req, res) => {
    try {
        const { vehicleDetails, licenseDetails } = req.body;

        const vehicle = await Vehicle.create({
            ...vehicleDetails,
            licenseDetails
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all vehicles
// @route   GET /api/vehicle/getVehicles
// @access  Private
const getAllVehicles = asyncHandler(async (req, res) => {
    try {
        const { mode } = req.query;

        let query = {};
        if (mode === 'client') {
            query.vehicleStatus = { $in: ['AVAILABLE', 'IN_USE'] };
        }

        const vehicles = await Vehicle.find(query)
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        res.status(StatusCodes.OK).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all vehicles with location and driver info
// @route   GET /api/vehicle/vehicles-with-location
// @access  Private
const getAllVehiclesWithLocation = asyncHandler(async (req, res) => {
    try {
        const vehicles = await Vehicle.find({})
            .populate('driverId', 'firstName lastName')
            .populate('department', 'name')
            .select('registration currentLocation make model color department');

        res.status(StatusCodes.OK).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get vehicle with location and driver info
// @route   GET /api/vehicle/vehicle-with-location/:vehicleReg
// @access  Private
const getVehicleWithLocation = asyncHandler(async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ registration: req.params.vehicleReg })
            .populate('driverId', 'firstName lastName')
            .populate('department', 'name')
            .select('registration currentLocation make model color department');

        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get vehicles by department
// @route   GET /api/vehicle/getVehiclesByDepartment
// @access  Private
const getVehiclesByDepartment = asyncHandler(async (req, res) => {
    try {
        const { department } = req.query;

        const vehicles = await Vehicle.find({ department })
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        res.status(StatusCodes.OK).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get vehicle by registration
// @route   GET /api/vehicle
// @access  Private
const getVehicleByRegistration = asyncHandler(async (req, res) => {
    try {
        const { vehicleReg } = req.query;

        const vehicle = await Vehicle.findOne({ registration: vehicleReg })
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update vehicle details
// @route   PUT /api/vehicle/update-details/:vehicleReg
// @access  Private
const updateVehicleDetails = asyncHandler(async (req, res) => {
    try {
        const { vehicleReg } = req.params;
        const updateData = req.body;

        const vehicle = await Vehicle.findOneAndUpdate(
            { registration: vehicleReg },
            updateData,
            { new: true, runValidators: true }
        )
        .populate('department', 'name')
        .populate('createdBy', 'firstName lastName');

        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Batch add vehicles from Cartrack
// @route   POST /api/vehicle/cartrack/batch-create-vehicles
// @access  Private
const batchAddVehiclesFromCartrack = asyncHandler(async (req, res) => {
    try {
        const { vehicles } = req.body;

        const createdVehicles = await Vehicle.insertMany(vehicles.map(v => ({
            registration: v.registration,
            make: v.manufacturer,
            model: v.model,
            color: v.colour,
            chasisNumber: v.chassis_number,
            status: 'available'
        })));

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Vehicles batch created successfully',
            data: createdVehicles
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update vehicle tracking details
// @route   PUT /api/vehicle/update-tracking/:vehicleReg
// @access  Private
const updateVehicleTracking = asyncHandler(async (req, res) => {
    try {
        const { vehicleReg } = req.params;
        const trackingDetails = req.body;
        
        const vehicle = await Vehicle.findOneAndUpdate(
            { registration: vehicleReg },
            { trackingDetails },
            { new: true, runValidators: true }
        )
        .populate('department', 'name')
        .populate('createdBy', 'firstName lastName');
        
        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }
        
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Tracking details updated successfully',
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get vehicles by status
// @route   GET /api/vehicle/status/:status
// @access  Private
const getVehiclesByStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['available', 'in-use', 'maintenance', 'out-of-service'];
        
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid status specified'
            });
        }
        
        const vehicles = await Vehicle.find({ status: status.toLowerCase() })
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        res.status(StatusCodes.OK).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicle/:id
// @access  Private
const getVehicleById = asyncHandler(async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get vehicle by vehicleId (custom ID)
// @route   GET /api/vehicle/by-vehicle-id/:vehicleId
// @access  Private
const getVehicleByVehicleId = asyncHandler(async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ vehicleId: req.params.vehicleId })
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
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
    getVehiclesByStatus,
    getVehicleByVehicleId,
    getVehicleById
};