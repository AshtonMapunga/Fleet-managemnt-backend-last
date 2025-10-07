const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const DriverBooking = require('../models/DriverBooking');
const Maintenance = require('../models/Maintenance');
const Fuel = require('../models/Fuel');
const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');

// ==================== DASHBOARD & OVERVIEW ====================
const getDashboardOverview = asyncHandler(async (req, res) => {
    try {
        const [
            totalVehicles,
            availableVehicles,
            inUseVehicles,
            maintenanceVehicles,
            totalDrivers,
            activeDrivers,
            activeTrips,
            completedTripsToday,
            maintenanceDue,
            totalFuelCost,
            totalMileage
        ] = await Promise.all([
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ status: 'available' }),
            Vehicle.countDocuments({ status: 'in-use' }),
            Vehicle.countDocuments({ status: 'maintenance' }),
            User.countDocuments({ role: 'driver' }),
            User.countDocuments({ role: 'driver', status: 'Active' }),
            DriverBooking.countDocuments({ status: { $in: ['scheduled', 'in-progress'] } }),
            DriverBooking.countDocuments({ 
                status: 'completed',
                createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
            }),
            Maintenance.countDocuments({ 
                scheduledDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                status: 'scheduled'
            }),
            Fuel.aggregate([{ $group: { _id: null, total: { $sum: '$totalCost' } } }]),
            Fuel.aggregate([{ $group: { _id: null, total: { $sum: '$odometerReading' } } }])
        ]);

        const notifications = await getNotifications();
        const liveVehicles = await Vehicle.find({ status: 'in-use' })
            .populate('department', 'name')
            .limit(10)
            .select('registration make model currentLocation status');

        const recentTrips = await DriverBooking.find()
            .populate('driverId', 'firstName lastName')
            .populate('vehicleId', 'registration make model')
            .sort({ createdAt: -1 })
            .limit(5);

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
                driverStats: {
                    totalDrivers,
                    activeDrivers,
                    inactiveDrivers: totalDrivers - activeDrivers
                },
                tripStats: {
                    activeTrips,
                    completedTripsToday,
                    completionRate: (activeTrips + completedTripsToday) > 0 ? 
                        (completedTripsToday / (activeTrips + completedTripsToday) * 100).toFixed(2) : 0
                },
                maintenance: {
                    due: maintenanceDue
                },
                metrics: {
                    totalFuelCost: totalFuelCost[0]?.total || 0,
                    totalMileage: totalMileage[0]?.total || 0
                },
                notifications,
                liveVehicles,
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

// ==================== USER & DRIVER MANAGEMENT CRUD ====================

// GET all users with filters
const getUsers = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, role, status, department, search } = req.query;
        let query = {};
        
        if (role) query.role = role;
        if (status) query.status = status;
        if (department) query.department = department;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .populate('department', 'name')
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);
        const activeDrivers = await User.countDocuments({ role: 'driver', status: 'Active' });
        const unassignedDrivers = await User.countDocuments({ role: 'driver', department: null });

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                users,
                statistics: { 
                    totalUsers: total, 
                    activeDrivers, 
                    unassignedDrivers,
                    inactiveDrivers: total - activeDrivers
                },
                pagination: { 
                    currentPage: parseInt(page), 
                    totalPages: Math.ceil(total / limit), 
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// CREATE user
const createUser = asyncHandler(async (req, res) => {
    try {
        const { 
            employeeNumber, 
            email, 
            password, 
            firstName, 
            lastName, 
            phone, 
            department, 
            role, 
            licenseNumber, 
            licenseExpiry 
        } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ 
            $or: [{ email }, { employeeNumber }] 
        });
        
        if (userExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false, 
                message: 'User with this email or employee number already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Get default permissions for role
        const defaultPermissions = User.getDefaultPermissions(role || 'user');

        const user = await User.create({
            employeeNumber, 
            email, 
            password: hashedPassword, 
            firstName, 
            lastName, 
            phone, 
            department,
            role: role || 'user', 
            licenseNumber, 
            licenseExpiry, 
            status: 'Active',
            permissions: defaultPermissions,
            isAdmin: role === 'admin' || role === 'super-admin',
            isDriver: role === 'driver'
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: 'User created successfully', 
            data: userResponse
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE user
const updateUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12);
        }

        const user = await User.findByIdAndUpdate(
            id, 
            updateData, 
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
            message: 'User updated successfully', 
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DEACTIVATE/ACTIVATE user
const toggleUserStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Status must be either Active or Inactive'
            });
        }

        const user = await User.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: `User ${status === 'Active' ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE user
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== VEHICLE MANAGEMENT CRUD ====================

// GET all vehicles
const getVehicles = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, status, department, search } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (department) query.department = department;
        if (search) {
            query.$or = [
                { registration: { $regex: search, $options: 'i' } },
                { make: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(query)
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Vehicle.countDocuments(query);
        const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
        const inMaintenance = await Vehicle.countDocuments({ status: 'maintenance' });
        const inUse = await Vehicle.countDocuments({ status: 'in-use' });

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                vehicles,
                statistics: { 
                    totalVehicles: total, 
                    availableVehicles, 
                    inMaintenance,
                    inUse
                },
                pagination: { 
                    currentPage: parseInt(page), 
                    totalPages: Math.ceil(total / limit), 
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// CREATE vehicle
const createVehicle = asyncHandler(async (req, res) => {
    try {
        const { 
            registration, 
            make, 
            model, 
            year, 
            color, 
            vehicleType, 
            fuelType, 
            department, 
            insuranceExpiry, 
            notes 
        } = req.body;

        // Check if vehicle already exists
        const vehicleExists = await Vehicle.findOne({ registration });
        if (vehicleExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false, 
                message: 'Vehicle with this registration already exists'
            });
        }

        const vehicle = await Vehicle.create({
            registration, 
            make, 
            model, 
            year, 
            color, 
            vehicleType, 
            fuelType, 
            department, 
            insuranceExpiry, 
            notes, 
            createdBy: req.user._id,
            status: 'available'
        });

        const populatedVehicle = await Vehicle.findById(vehicle._id)
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName');

        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: 'Vehicle created successfully', 
            data: populatedVehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE vehicle
const updateVehicle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const vehicle = await Vehicle.findByIdAndUpdate(
            id, 
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

// ASSIGN/UNASSIGN vehicle to driver
const assignVehicle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId, assign } = req.body;

        if (assign && !driverId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Driver ID is required when assigning vehicle'
            });
        }

        const updateData = {
            status: assign ? 'in-use' : 'available'
        };

        const vehicle = await Vehicle.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
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
            message: `Vehicle ${assign ? 'assigned' : 'unassigned'} successfully`,
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// RETIRE vehicle
const retireVehicle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByIdAndUpdate(
            id, 
            { status: 'out-of-service' }, 
            { new: true }
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
            message: 'Vehicle retired successfully', 
            data: vehicle
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE vehicle
const deleteVehicle = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByIdAndDelete(id);

        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Vehicle not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== TRIP MANAGEMENT CRUD ====================

// GET all trips
const getTrips = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, status, date, driverId, vehicleId } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (driverId) query.driverId = driverId;
        if (vehicleId) query.vehicleId = vehicleId;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.scheduledPickupTime = { $gte: startDate, $lt: endDate };
        }

        const trips = await DriverBooking.find(query)
            .populate('driverId', 'firstName lastName')
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name')
            .populate('createdBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ scheduledPickupTime: -1 });

        const total = await DriverBooking.countDocuments(query);
        
        // Trip statistics
        const activeTrips = await DriverBooking.countDocuments({ status: { $in: ['scheduled', 'in-progress'] } });
        const completedTrips = await DriverBooking.countDocuments({ status: 'completed' });
        const canceledTrips = await DriverBooking.countDocuments({ status: 'cancelled' });
        const delayedTrips = await DriverBooking.countDocuments({ status: 'delayed' });

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                trips,
                statistics: { 
                    totalTrips: total, 
                    activeTrips, 
                    completedTrips, 
                    canceledTrips,
                    delayedTrips
                },
                pagination: { 
                    currentPage: parseInt(page), 
                    totalPages: Math.ceil(total / limit), 
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// CREATE trip
const createTrip = asyncHandler(async (req, res) => {
    try {
        const { 
            driverId, 
            vehicleId, 
            passengerName, 
            passengerContact, 
            pickupLocation, 
            destination, 
            scheduledPickupTime, 
            purpose, 
            department 
        } = req.body;

        // Check if vehicle is available
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || vehicle.status !== 'available') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Selected vehicle is not available'
            });
        }

        const trip = await DriverBooking.create({
            driverId, 
            vehicleId, 
            passengerName, 
            passengerContact, 
            pickupLocation, 
            destination, 
            scheduledPickupTime, 
            purpose, 
            department, 
            createdBy: req.user._id,
            status: 'scheduled'
        });

        // Update vehicle status
        await Vehicle.findByIdAndUpdate(vehicleId, { status: 'in-use' });

        const populatedTrip = await DriverBooking.findById(trip._id)
            .populate('driverId', 'firstName lastName')
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name');

        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: 'Trip created successfully', 
            data: populatedTrip
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE trip status
const updateTripStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled', 'delayed'];
        if (!validStatuses.includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const trip = await DriverBooking.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        )
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'registration make model')
        .populate('department', 'name');

        if (!trip) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Trip not found' 
            });
        }

        // If trip is completed or cancelled, make vehicle available again
        if (status === 'completed' || status === 'cancelled') {
            await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Trip status updated successfully', 
            data: trip
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// REASSIGN trip
const reassignTrip = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId, vehicleId } = req.body;

        const trip = await DriverBooking.findByIdAndUpdate(
            id, 
            { driverId, vehicleId }, 
            { new: true }
        )
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'registration make model')
        .populate('department', 'name');

        if (!trip) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Trip not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Trip reassigned successfully', 
            data: trip
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// CANCEL trip
const cancelTrip = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const trip = await DriverBooking.findByIdAndUpdate(
            id, 
            { 
                status: 'cancelled', 
                notes: cancellationReason ? `Cancelled: ${cancellationReason}` : 'Trip cancelled' 
            }, 
            { new: true }
        )
        .populate('driverId', 'firstName lastName')
        .populate('vehicleId', 'registration make model');

        if (!trip) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Trip not found' 
            });
        }

        // Make vehicle available again
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Trip cancelled successfully', 
            data: trip
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE trip
const deleteTrip = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const trip = await DriverBooking.findByIdAndDelete(id);

        if (!trip) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Trip not found' 
            });
        }

        // If trip was active, make vehicle available
        if (trip.status === 'scheduled' || trip.status === 'in-progress') {
            await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== MAINTENANCE MANAGEMENT CRUD ====================

// GET all maintenance records
const getMaintenance = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, status, type, vehicleId } = req.query;
        let query = {};
        
        if (status) query.status = status;
        if (type) query.maintenanceType = type;
        if (vehicleId) query.vehicleId = vehicleId;

        const maintenance = await Maintenance.find(query)
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name')
            .populate('performedBy', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ scheduledDate: 1 });

        const total = await Maintenance.countDocuments(query);
        const scheduled = await Maintenance.countDocuments({ status: 'scheduled' });
        const inProgress = await Maintenance.countDocuments({ status: 'in-progress' });
        const completed = await Maintenance.countDocuments({ status: 'completed' });

        // Spare parts summary (simplified)
        const sparePartsSummary = {
            totalItems: 156,
            lowStock: 23,
            outOfStock: 5,
            criticalItems: 8
        };

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                maintenance,
                spareParts: sparePartsSummary,
                statistics: { 
                    total, 
                    scheduled, 
                    inProgress, 
                    completed,
                    overdue: await Maintenance.countDocuments({ 
                        scheduledDate: { $lt: new Date() },
                        status: { $in: ['scheduled', 'in-progress'] }
                    })
                },
                pagination: { 
                    currentPage: parseInt(page), 
                    totalPages: Math.ceil(total / limit), 
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// SCHEDULE maintenance
const scheduleMaintenance = asyncHandler(async (req, res) => {
    try {
        const { 
            vehicleId, 
            maintenanceType, 
            description, 
            scheduledDate, 
            cost, 
            serviceProvider, 
            partsReplaced 
        } = req.body;

        const maintenance = await Maintenance.create({
            vehicleId, 
            maintenanceType, 
            description, 
            scheduledDate, 
            cost, 
            serviceProvider, 
            partsReplaced, 
            department: req.user.department, 
            createdBy: req.user._id,
            status: 'scheduled'
        });

        // Update vehicle status to maintenance if it's a major repair
        if (maintenanceType === 'repair' || maintenanceType === 'accident-repair') {
            await Vehicle.findByIdAndUpdate(vehicleId, { status: 'maintenance' });
        }

        const populatedMaintenance = await Maintenance.findById(maintenance._id)
            .populate('vehicleId', 'registration make model')
            .populate('department', 'name');

        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: 'Maintenance scheduled successfully', 
            data: populatedMaintenance
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE maintenance
const updateMaintenance = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const maintenance = await Maintenance.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        )
        .populate('vehicleId', 'registration make model')
        .populate('department', 'name')
        .populate('performedBy', 'firstName lastName');

        if (!maintenance) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Maintenance record not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Maintenance updated successfully', 
            data: maintenance
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// COMPLETE maintenance
const completeMaintenance = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { actualCost, notes, performedBy } = req.body;

        const maintenance = await Maintenance.findByIdAndUpdate(
            id, 
            { 
                status: 'completed', 
                completedDate: new Date(),
                cost: actualCost,
                performedBy: performedBy || req.user._id,
                notes: notes || 'Maintenance completed successfully'
            }, 
            { new: true }
        )
        .populate('vehicleId', 'registration make model')
        .populate('performedBy', 'firstName lastName');

        if (!maintenance) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Maintenance record not found' 
            });
        }

        // Make vehicle available again
        await Vehicle.findByIdAndUpdate(maintenance.vehicleId, { status: 'available' });

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Maintenance marked as completed', 
            data: maintenance
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE maintenance
const deleteMaintenance = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await Maintenance.findByIdAndDelete(id);

        if (!maintenance) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Maintenance record not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Maintenance record deleted successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== FUEL & EXPENSE CRUD ====================

// GET all fuel records
const getFuelRecords = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, vehicleId, driverId, startDate, endDate, verified } = req.query;
        let query = {};
        
        if (vehicleId) query.vehicleId = vehicleId;
        if (driverId) query.driverId = driverId;
        if (verified !== undefined) query.isVerified = verified === 'true';
        if (startDate || endDate) {
            query.fuelingDate = {};
            if (startDate) query.fuelingDate.$gte = new Date(startDate);
            if (endDate) query.fuelingDate.$lte = new Date(endDate);
        }

        const fuelRecords = await Fuel.find(query)
            .populate('vehicleId', 'registration make model')
            .populate('driverId', 'firstName lastName')
            .populate('department', 'name')
            .populate('recordedBy', 'firstName lastName')
            .populate('verifiedBy', 'firstName lastName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ fuelingDate: -1 });

        const total = await Fuel.countDocuments(query);
        
        // Fuel statistics
        const fuelStats = await Fuel.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalFuel: { $sum: '$fuelAmount' },
                    totalCost: { $sum: '$totalCost' },
                    avgCostPerLiter: { $avg: '$costPerUnit' },
                    totalEntries: { $sum: 1 }
                }
            }
        ]);

        const pendingExpenses = await Fuel.countDocuments({ ...query, isVerified: false });
        const verifiedExpenses = await Fuel.countDocuments({ ...query, isVerified: true });

        // Fuel efficiency anomalies (vehicles with efficiency > 15L/100km)
        const criticalAnomalies = await Fuel.aggregate([
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
                    avgEfficiency: {
                        $avg: {
                            $multiply: [
                                { $divide: ['$fuelAmount', { $max: [1, '$odometerReading'] }] },
                                100
                            ]
                        }
                    }
                }
            },
            {
                $match: {
                    avgEfficiency: { $gt: 15 } // More than 15L/100km
                }
            }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                fuelRecords,
                statistics: {
                    totalFuel: fuelStats[0]?.totalFuel || 0,
                    totalCost: fuelStats[0]?.totalCost || 0,
                    avgCostPerLiter: fuelStats[0]?.avgCostPerLiter || 0,
                    totalEntries: fuelStats[0]?.totalEntries || 0,
                    pendingExpenses,
                    verifiedExpenses,
                    criticalAnomalies: criticalAnomalies.length
                },
                anomalies: criticalAnomalies,
                pagination: { 
                    currentPage: parseInt(page), 
                    totalPages: Math.ceil(total / limit), 
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ADD fuel record
const addFuelRecord = asyncHandler(async (req, res) => {
    try {
        const { 
            vehicleId, 
            driverId, 
            fuelingDate, 
            odometerReading, 
            fuelAmount, 
            fuelType, 
            costPerUnit, 
            fuelingLocation, 
            fuelCardNumber,
            receiptNumber 
        } = req.body;

        const fuelRecord = await Fuel.create({
            vehicleId, 
            driverId, 
            fuelingDate, 
            odometerReading, 
            fuelAmount, 
            fuelType,
            costPerUnit, 
            fuelingLocation, 
            fuelCardNumber,
            receiptNumber,
            department: req.user.department,
            recordedBy: req.user._id,
            isVerified: false
        });

        const populatedRecord = await Fuel.findById(fuelRecord._id)
            .populate('vehicleId', 'registration make model')
            .populate('driverId', 'firstName lastName')
            .populate('department', 'name');

        res.status(StatusCodes.CREATED).json({
            success: true, 
            message: 'Fuel record added successfully', 
            data: populatedRecord
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE fuel record
const updateFuelRecord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const fuelRecord = await Fuel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        )
        .populate('vehicleId', 'registration make model')
        .populate('driverId', 'firstName lastName')
        .populate('department', 'name');

        if (!fuelRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Fuel record not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Fuel record updated successfully', 
            data: fuelRecord
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// VERIFY fuel expense
const verifyFuelExpense = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const fuelRecord = await Fuel.findByIdAndUpdate(
            id, 
            { 
                isVerified: true, 
                verifiedBy: req.user._id, 
                verifiedAt: new Date() 
            }, 
            { new: true }
        )
        .populate('vehicleId', 'registration make model')
        .populate('driverId', 'firstName lastName')
        .populate('verifiedBy', 'firstName lastName');

        if (!fuelRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Fuel record not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Fuel expense verified successfully', 
            data: fuelRecord
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE fuel record
const deleteFuelRecord = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const fuelRecord = await Fuel.findByIdAndDelete(id);

        if (!fuelRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({ 
                success: false, 
                message: 'Fuel record not found' 
            });
        }

        res.status(StatusCodes.OK).json({
            success: true, 
            message: 'Fuel record deleted successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== ANALYTICS ====================
const getAnalytics = asyncHandler(async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        // Fleet utilization
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

        // Cost analysis
        const costAnalysis = await Maintenance.aggregate([
            {
                $group: {
                    _id: '$maintenanceType',
                    totalCost: { $sum: '$cost' },
                    count: { $sum: 1 }
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
                    totalDistance: { $sum: '$distance' },
                    onTimeRate: {
                        $avg: {
                            $cond: [
                                { $lte: ['$actualPickupTime', '$scheduledPickupTime'] },
                                1, 0
                            ]
                        }
                    }
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
            },
            {
                $project: {
                    driverName: { $concat: ['$driver.firstName', ' ', '$driver.lastName'] },
                    completedTrips: 1,
                    totalDistance: 1,
                    onTimeRate: { $multiply: ['$onTimeRate', 100] }
                }
            }
        ]);

        // Fuel efficiency
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
                    distance: { 
                        $sum: { 
                            $subtract: [
                                '$odometerReading', 
                                { $ifNull: ['$previousOdometer', '$odometerReading'] }
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    vehicle: 1,
                    totalFuel: 1,
                    totalCost: 1,
                    distance: 1,
                    efficiency: {
                        $cond: [
                            { $gt: ['$distance', 0] },
                            { $divide: ['$totalFuel', { $divide: ['$distance', 100] }] },
                            0
                        ]
                    },
                    costPerKm: {
                        $cond: [
                            { $gt: ['$distance', 0] },
                            { $divide: ['$totalCost', '$distance'] },
                            0
                        ]
                    }
                }
            }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                overview: {
                    totalVehicles: await Vehicle.countDocuments(),
                    totalDrivers: await User.countDocuments({ role: 'driver' }),
                    activeTrips: await DriverBooking.countDocuments({ status: { $in: ['scheduled', 'in-progress'] } }),
                    maintenanceDue: await Maintenance.countDocuments({ status: 'scheduled' })
                },
                fleetUtilization,
                tripAnalytics,
                costAnalysis,
                driverPerformance,
                fuelEfficiency
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== COMPLIANCE & SAFETY ====================
const getComplianceSafety = asyncHandler(async (req, res) => {
    try {
        // Driver compliance
        const totalDrivers = await User.countDocuments({ role: 'driver' });
        const compliantDrivers = await User.countDocuments({
            role: 'driver',
            licenseExpiry: { $gt: new Date() },
            status: 'Active'
        });

        // Vehicle compliance
        const totalVehicles = await Vehicle.countDocuments();
        const compliantVehicles = await Vehicle.countDocuments({
            insuranceExpiry: { $gt: new Date() }
        });

        // Active alerts
        const activeAlerts = await getNotifications();

        // Expiring documents
        const expiringLicenses = await User.countDocuments({
            role: 'driver',
            licenseExpiry: { 
                $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                $gt: new Date()
            }
        });

        const expiringInsurance = await Vehicle.countDocuments({
            insuranceExpiry: { 
                $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                $gt: new Date()
            }
        });

        // Safety incidents (simplified)
        const safetyIncidents = {
            total: 12,
            thisMonth: 2,
            resolved: 10,
            critical: 1
        };

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                driverCompliance: {
                    totalDrivers,
                    compliantDrivers,
                    nonCompliantDrivers: totalDrivers - compliantDrivers,
                    complianceRate: totalDrivers > 0 ? ((compliantDrivers / totalDrivers) * 100).toFixed(2) : 0
                },
                vehicleCompliance: {
                    totalVehicles,
                    compliantVehicles,
                    nonCompliantVehicles: totalVehicles - compliantVehicles,
                    complianceRate: totalVehicles > 0 ? ((compliantVehicles / totalVehicles) * 100).toFixed(2) : 0
                },
                alerts: {
                    total: activeAlerts.reduce((sum, alert) => sum + alert.count, 0),
                    highPriority: activeAlerts.filter(a => a.priority === 'high').length,
                    mediumPriority: activeAlerts.filter(a => a.priority === 'medium').length
                },
                expiringDocuments: {
                    licenses: expiringLicenses,
                    insurance: expiringInsurance,
                    total: expiringLicenses + expiringInsurance
                },
                safetyIncidents
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ==================== SYSTEM & ACCESS CONTROL ====================
const getSystemAccess = asyncHandler(async (req, res) => {
    try {
        // User statistics
        const totalUsers = await User.countDocuments();
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Department statistics
        const departmentStats = await Department.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'department',
                    as: 'users'
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: 'department',
                    as: 'vehicles'
                }
            },
            {
                $project: {
                    name: 1,
                    userCount: { $size: '$users' },
                    vehicleCount: { $size: '$vehicles' }
                }
            }
        ]);

        // Geofence zones (simplified)
        const geofenceZones = {
            total: 15,
            active: 12,
            restricted: 3,
            complianceZones: 8
        };

        // Audit entries (simplified)
        const auditEntries = {
            total: 1287,
            today: 23,
            thisWeek: 156,
            thisMonth: 589
        };

        // System settings summary
        const systemSettings = {
            departments: await Department.countDocuments(),
            vehicles: await Vehicle.countDocuments(),
            drivers: await User.countDocuments({ role: 'driver' }),
            activeTrips: await DriverBooking.countDocuments({ status: { $in: ['scheduled', 'in-progress'] } }),
            maintenanceTasks: await Maintenance.countDocuments({ status: 'scheduled' }),
            pendingExpenses: await Fuel.countDocuments({ isVerified: false })
        };

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    byRole: usersByRole
                },
                departments: departmentStats,
                geofenceZones,
                auditEntries,
                systemSettings
            }
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Helper function for notifications
const getNotifications = async () => {
    const [
        complianceAlerts,
        maintenanceAlerts,
        licenseExpiry,
        insuranceExpiry
    ] = await Promise.all([
        Vehicle.countDocuments({ insuranceExpiry: { $lte: new Date() } }),
        Maintenance.countDocuments({ 
            scheduledDate: { $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
            status: 'scheduled'
        }),
        User.countDocuments({ 
            licenseExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
            role: 'driver'
        }),
        Vehicle.countDocuments({ 
            insuranceExpiry: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        })
    ]);

    return [
        {
            type: 'compliance',
            title: 'Compliance Alert',
            message: `${complianceAlerts} vehicles with expired insurance`,
            count: complianceAlerts,
            priority: 'high'
        },
        {
            type: 'maintenance',
            title: 'Scheduled Maintenance',
            message: `${maintenanceAlerts} maintenance tasks due soon`,
            count: maintenanceAlerts,
            priority: 'medium'
        },
        {
            type: 'license',
            title: 'License Expiry',
            message: `${licenseExpiry} driver licenses expiring soon`,
            count: licenseExpiry,
            priority: 'medium'
        },
        {
            type: 'insurance',
            title: 'Insurance Renewal',
            message: `${insuranceExpiry} vehicle insurance expiring soon`,
            count: insuranceExpiry,
            priority: 'medium'
        }
    ];
};

module.exports = {
    // Dashboard
    getDashboardOverview,
    
    // User Management
    getUsers, createUser, updateUser, toggleUserStatus, deleteUser,
    
    // Vehicle Management  
    getVehicles, createVehicle, updateVehicle, assignVehicle, retireVehicle, deleteVehicle,
    
    // Trip Management
    getTrips, createTrip, updateTripStatus, reassignTrip, cancelTrip, deleteTrip,
    
    // Maintenance Management
    getMaintenance, scheduleMaintenance, updateMaintenance, completeMaintenance, deleteMaintenance,
    
    // Fuel & Expense
    getFuelRecords, addFuelRecord, updateFuelRecord, verifyFuelExpense, deleteFuelRecord,
    
    // Analytics & Reports
    getAnalytics,
    
    // Compliance & Safety
    getComplianceSafety,
    
    // System & Access Control
    getSystemAccess
};