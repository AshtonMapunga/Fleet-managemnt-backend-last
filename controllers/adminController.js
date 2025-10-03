// controllers/adminController.js
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const DriverBooking = require('../models/DriverBooking');
const Maintenance = require('../models/Maintenance');
const Fuel = require('../models/Fuel');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Get dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardOverview = asyncHandler(async (req, res) => {
    try {
        // Real-time fleet overview
        const totalVehicles = await Vehicle.countDocuments();
        const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
        const inUseVehicles = await Vehicle.countDocuments({ status: 'in-use' });
        const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });

        // Active trips
        const activeTrips = await DriverBooking.countDocuments({ 
            status: { $in: ['scheduled', 'in-progress'] } 
        });

        // Driver status
        const totalDrivers = await User.countDocuments({ isDriver: true });
        const activeDrivers = await User.countDocuments({ 
            isDriver: true, 
            status: 'Active' 
        });

        // Recent maintenance alerts
        const maintenanceAlerts = await Maintenance.find({
            scheduledDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Next 7 days
            status: 'scheduled'
        }).populate('vehicleId', 'registration make model');

        // Recent trips
        const recentTrips = await DriverBooking.find()
            .populate('driverId', 'firstName lastName')
            .populate('vehicleId', 'registration make model')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                fleetOverview: {
                    totalVehicles,
                    availableVehicles,
                    inUseVehicles,
                    maintenanceVehicles,
                    utilizationRate: totalVehicles > 0 ? ((inUseVehicles / totalVehicles) * 100).toFixed(2) : 0
                },
                trips: {
                    activeTrips,
                    totalDrivers,
                    activeDrivers
                },
                maintenanceAlerts,
                recentTrips
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get comprehensive analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = asyncHandler(async (req, res) => {
    try {
        const { period = 'month' } = req.query; // day, week, month, year
        
        // Fleet utilization report
        const fleetUtilization = await Vehicle.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Trip analytics
        const tripAnalytics = await DriverBooking.aggregate([
            {
                $match: {
                    createdAt: { 
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                    }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalCost: { $sum: '$actualCost' }
                }
            }
        ]);

        // Fuel efficiency report
        const fuelEfficiency = await Fuel.aggregate([
            {
                $lookup: {
                    from: 'vehicles',
                    localField: 'vehicleId',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            {
                $unwind: '$vehicle'
            },
            {
                $group: {
                    _id: '$vehicleId',
                    vehicle: { $first: '$vehicle.registration' },
                    totalFuel: { $sum: '$fuelAmount' },
                    totalCost: { $sum: '$totalCost' },
                    avgCostPerLiter: { $avg: '$costPerUnit' }
                }
            }
        ]);

        // Driver performance
        const driverPerformance = await DriverBooking.aggregate([
            {
                $match: { status: 'completed' }
            },
            {
                $group: {
                    _id: '$driverId',
                    completedTrips: { $sum: 1 },
                    totalDistance: { $sum: '$distance' }, // You might need to add distance field
                    avgRating: { $avg: '$rating' } // You might need to add rating field
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'driver'
                }
            },
            {
                $unwind: '$driver'
            }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                fleetUtilization,
                tripAnalytics,
                fuelEfficiency,
                driverPerformance
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Create user with specific role and permissions
// @route   POST /api/admin/users
// @access  Private (Admin only)
const createUserWithRole = asyncHandler(async (req, res) => {
    try {
        const {
            employeeNumber, email, password, firstName, lastName, phone, department,
            role, permissions, departmentAccess, subsidiaryAccess
        } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ 
            $or: [{ email }, { employeeNumber }] 
        });

        if (userExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'User already exists with this email or employee number'
            });
        }

        const user = await User.create({
            employeeNumber,
            email,
            password,
            firstName,
            lastName,
            phone,
            department,
            role: role || 'driver',
            permissions: permissions || {},
            departmentAccess: departmentAccess || [],
            subsidiaryAccess: subsidiaryAccess || [],
            status: 'Active'
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'User created successfully with role',
            data: userResponse
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update user roles and permissions
// @route   PUT /api/admin/users/:id/roles
// @access  Private (Admin only)
const updateUserRoles = asyncHandler(async (req, res) => {
    try {
        const { role, permissions, departmentAccess, subsidiaryAccess, status } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                role,
                permissions,
                departmentAccess,
                subsidiaryAccess,
                status,
                // Update legacy fields for backward compatibility
                isAdmin: role === 'admin' || role === 'super-admin',
                isDriver: role === 'driver'
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User roles and permissions updated successfully',
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get system-wide statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin only)
const getSystemStatistics = asyncHandler(async (req, res) => {
    try {
        const [
            totalUsers,
            totalDrivers,
            totalVehicles,
            totalTrips,
            activeTrips,
            maintenanceDue,
            fuelConsumption
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isDriver: true }),
            Vehicle.countDocuments(),
            DriverBooking.countDocuments(),
            DriverBooking.countDocuments({ status: { $in: ['scheduled', 'in-progress'] } }),
            Maintenance.countDocuments({ 
                scheduledDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                status: 'scheduled'
            }),
            Fuel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalFuel: { $sum: '$fuelAmount' },
                        totalCost: { $sum: '$totalCost' }
                    }
                }
            ])
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                totalUsers,
                totalDrivers,
                totalVehicles,
                totalTrips,
                activeTrips,
                maintenanceDue,
                fuelConsumption: fuelConsumption[0] || { totalFuel: 0, totalCost: 0 }
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    getDashboardOverview,
    getAnalytics,
    createUserWithRole,
    updateUserRoles,
    getSystemStatistics
};