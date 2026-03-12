const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const DriverBooking = require('../models/DriverBooking');

// @desc    Driver login
// @route   POST /api/driver/login
// @access  Public
const driverLogin = asyncHandler(async (req, res) => {
    const { employeeNumber, password } = req.body;

    // Find driver by employee number
    const driver = await User.findOne({ 
        employeeNumber,
        role: 'driver',
        status: 'Active'
    }).select('+password');

    if (!driver) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid employee number or password');
    }

    // Check password
    const isPasswordMatch = await driver.matchPassword(password);
    if (!isPasswordMatch) {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Invalid employee number or password');
    }

    // Generate token
    const token = driver.getSignedJwtToken();

    // Remove password from response
    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            driver: driverResponse,
            token
        }
    });
});

// @desc    Get driver profile
// @route   GET /api/driver/profile
// @access  Private/Driver
const getDriverProfile = asyncHandler(async (req, res) => {
    const driver = await User.findById(req.user._id)
        .select('-password')
        .populate('department', 'name');

    res.json({
        success: true,
        data: driver
    });
});

// @desc    Get assigned vehicle for current driver
// @route   GET /api/driver/assigned-vehicle
// @access  Private/Driver
const getAssignedVehicle = asyncHandler(async (req, res) => {
    // Find active booking for this driver
    const activeBooking = await DriverBooking.findOne({
        driver: req.user._id,
        status: { $in: ['active', 'approved'] }
    }).populate('vehicle');

    if (!activeBooking || !activeBooking.vehicle) {
        // Check if any trip is in progress with this driver
        const activeTrip = await Trip.findOne({
            driver: req.user._id,
            status: 'in-progress'
        }).populate('vehicle');

        if (activeTrip && activeTrip.vehicle) {
            return res.json({
                success: true,
                data: activeTrip.vehicle,
                fromTrip: true
            });
        }

        return res.json({
            success: true,
            data: null,
            message: 'No vehicle assigned'
        });
    }

    res.json({
        success: true,
        data: activeBooking.vehicle
    });
});

// @desc    Get assigned trips for current driver
// @route   GET /api/driver/trips
// @access  Private/Driver
const getDriverTrips = asyncHandler(async (req, res) => {
    const { status } = req.query;
    
    let query = { driver: req.user._id };
    
    if (status) {
        query.status = status;
    }

    const trips = await Trip.find(query)
        .populate('vehicle', 'registration make model')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: trips.length,
        data: trips
    });
});

// @desc    Get single trip details
// @route   GET /api/driver/trips/:id
// @access  Private/Driver
const getTripDetails = asyncHandler(async (req, res) => {
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id
    })
    .populate('vehicle', 'registration make model fuelType')
    .populate('createdBy', 'firstName lastName');

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Trip not found');
    }

    res.json({
        success: true,
        data: trip
    });
});

// @desc    Start a trip
// @route   POST /api/driver/trips/:id/start
// @access  Private/Driver
const startTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id,
        status: 'scheduled'
    });

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Trip not found or cannot be started');
    }

    trip.status = 'in-progress';
    trip.startTime = new Date();
    
    // Add initial GPS location if provided
    if (req.body.currentLocation) {
        trip.gpsLocations.push({
            lat: req.body.currentLocation.lat,
            lng: req.body.currentLocation.lng,
            timestamp: new Date()
        });
    }

    await trip.save();

    res.json({
        success: true,
        message: 'Trip started successfully',
        data: trip
    });
});

// @desc    End a trip
// @route   POST /api/driver/trips/:id/end
// @access  Private/Driver
const endTrip = asyncHandler(async (req, res) => {
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id,
        status: 'in-progress'
    });

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Active trip not found');
    }

    trip.status = 'completed';
    trip.endTime = new Date();
    
    if (req.body.fuelUsed) {
        trip.fuelUsed = req.body.fuelUsed;
    }
    
    if (req.body.distance) {
        trip.distance = req.body.distance;
    }

    // Add final GPS location if provided
    if (req.body.currentLocation) {
        trip.gpsLocations.push({
            lat: req.body.currentLocation.lat,
            lng: req.body.currentLocation.lng,
            timestamp: new Date()
        });
    }

    await trip.save();

    res.json({
        success: true,
        message: 'Trip ended successfully',
        data: trip
    });
});

// @desc    Update GPS location
// @route   POST /api/driver/trips/:id/gps
// @access  Private/Driver
const updateGPSLocation = asyncHandler(async (req, res) => {
    const { lat, lng, speed } = req.body;
    
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id,
        status: 'in-progress'
    });

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Active trip not found');
    }

    trip.gpsLocations.push({
        lat,
        lng,
        speed: speed || 0,
        timestamp: new Date()
    });

    // Keep only last 1000 locations to prevent document growth
    if (trip.gpsLocations.length > 1000) {
        trip.gpsLocations = trip.gpsLocations.slice(-1000);
    }

    await trip.save();

    res.json({
        success: true,
        message: 'GPS location updated',
        data: {
            locationsCount: trip.gpsLocations.length
        }
    });
});

// @desc    Report vehicle issue
// @route   POST /api/driver/trips/:id/issues
// @access  Private/Driver
const reportIssue = asyncHandler(async (req, res) => {
    const { type, description } = req.body;
    
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id
    });

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Trip not found');
    }

    trip.issues.push({
        type,
        description,
        reportedAt: new Date(),
        resolved: false
    });

    await trip.save();

    res.json({
        success: true,
        message: 'Issue reported successfully',
        data: trip.issues[trip.issues.length - 1]
    });
});

// @desc    Upload trip document
// @route   POST /api/driver/trips/:id/documents
// @access  Private/Driver
const uploadDocument = asyncHandler(async (req, res) => {
    const { type, url } = req.body;
    
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id
    });

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Trip not found');
    }

    trip.documents.push({
        type,
        url,
        uploadedAt: new Date()
    });

    await trip.save();

    res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: trip.documents[trip.documents.length - 1]
    });
});

// @desc    Report fuel usage
// @route   POST /api/driver/trips/:id/fuel
// @access  Private/Driver
const reportFuel = asyncHandler(async (req, res) => {
    const { amount, cost, odometer } = req.body;
    
    const trip = await Trip.findOne({
        _id: req.params.id,
        driver: req.user._id
    });

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Trip not found');
    }

    // Update fuel used
    if (amount) {
        trip.fuelUsed += amount;
    }

    await trip.save();

    // Here you might also want to create a fuel record in a separate Fuel collection
    // For now, we'll just update the trip

    res.json({
        success: true,
        message: 'Fuel usage reported',
        data: {
            totalFuelUsed: trip.fuelUsed
        }
    });
});

// @desc    Get route navigation (simplified - would integrate with Google Maps API)
// @route   GET /api/driver/trips/:id/navigation
// @access  Private/Driver
const getNavigation = asyncHandler(async (req, res) => {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Trip not found');
    }

    // This would typically integrate with Google Maps or similar service
    // For now, return basic route info
    res.json({
        success: true,
        data: {
            from: trip.startLocation,
            to: trip.destination,
            route: trip.route || 'No specific route provided',
            // In production, you'd return actual navigation data from mapping service
            navigationUrl: `https://maps.google.com/?saddr=${encodeURIComponent(trip.startLocation)}&daddr=${encodeURIComponent(trip.destination)}`
        }
    });
});

module.exports = {
    driverLogin,
    getDriverProfile,
    getAssignedVehicle,
    getDriverTrips,
    getTripDetails,
    startTrip,
    endTrip,
    updateGPSLocation,
    reportIssue,
    uploadDocument,
    reportFuel,
    getNavigation
};
