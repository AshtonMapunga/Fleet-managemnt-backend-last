// Replace your entire fuelController.js with this code:

const Fuel = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// Helper function to detect unusual patterns
async function checkUnusualPatterns(vehicleId, startDate, endDate) {
    const patterns = await Fuel.aggregate([
        {
            $match: {
                vehicleId: new mongoose.Types.ObjectId(vehicleId), // FIXED: Added 'new'
                fuelingDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: null,
                avgFuelAmount: { $avg: '$fuelAmount' },
                maxFuelAmount: { $max: '$fuelAmount' },
                minFuelAmount: { $min: '$fuelAmount' },
                totalEntries: { $sum: 1 }
            }
        }
    ]);

    if (patterns.length === 0) return [];

    const pattern = patterns[0];
    const anomalies = [];

    if (pattern.maxFuelAmount > pattern.avgFuelAmount * 2) {
        anomalies.push('Unusually large fuel purchase detected');
    }

    if (pattern.totalEntries > 20) {
        anomalies.push('High frequency of refueling');
    }

    return anomalies;
}

// @desc    Record fuel transaction
// @route   POST /api/fuel/record
// @access  Private
const recordFuel = asyncHandler(async (req, res) => {
    try {
        const fuelData = req.body;
        
        // Calculate totalCost if not provided
        if (!fuelData.totalCost && fuelData.fuelAmount && fuelData.costPerUnit) {
            fuelData.totalCost = fuelData.fuelAmount * fuelData.costPerUnit;
        }
        
        const fuelRecord = await Fuel.create(fuelData);

        await Vehicle.findByIdAndUpdate(
            fuelData.vehicleId,
            { $set: { mileage: fuelData.odometerReading } }
        );

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Fuel record created successfully',
            data: fuelRecord
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all fuel records
// @route   GET /api/fuel/
// @access  Private
const getAllFuelRecords = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 50, vehicleId, startDate, endDate } = req.query;
        
        let query = {};
        if (vehicleId) query.vehicleId = vehicleId;
        if (startDate || endDate) {
            query.fuelingDate = {};
            if (startDate) query.fuelingDate.$gte = new Date(startDate);
            if (endDate) query.fuelingDate.$lte = new Date(endDate);
        }

        const fuelRecords = await Fuel.find(query)
            .populate('vehicleId', 'registration make model')
            .populate('driverId', 'firstName lastName')
            .populate('recordedBy', 'firstName lastName')
            .sort({ fuelingDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Fuel.countDocuments(query);

        res.status(StatusCodes.OK).json({
            success: true,
            count: fuelRecords.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: fuelRecords
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get fuel records by vehicle
// @route   GET /api/fuel/vehicle/:vehicleId
// @access  Private
const getFuelByVehicle = asyncHandler(async (req, res) => {
    try {
        const fuelRecords = await Fuel.find({ vehicleId: req.params.vehicleId })
            .populate('vehicleId', 'registration make model')
            .populate('driverId', 'firstName lastName')
            .sort({ fuelingDate: -1 });

        res.status(StatusCodes.OK).json({
            success: true,
            count: fuelRecords.length,
            data: fuelRecords
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get single fuel record
// @route   GET /api/fuel/:id
// @access  Private
const getFuelRecordById = asyncHandler(async (req, res) => {
    try {
        const fuelRecord = await Fuel.findById(req.params.id)
            .populate('vehicleId', 'registration make model')
            .populate('driverId', 'firstName lastName')
            .populate('recordedBy', 'firstName lastName');

        if (!fuelRecord) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Fuel record not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: fuelRecord
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update fuel record
// @route   PUT /api/fuel/:id
// @access  Private
const updateFuelRecord = asyncHandler(async (req, res) => {
    try {
        const updatedFuel = await Fuel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('vehicleId', 'registration make model')
         .populate('driverId', 'firstName lastName');

        if (!updatedFuel) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Fuel record not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Fuel record updated successfully',
            data: updatedFuel
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Delete fuel record
// @route   DELETE /api/fuel/:id
// @access  Private
const deleteFuelRecord = asyncHandler(async (req, res) => {
    try {
        const fuelRecord = await Fuel.findByIdAndDelete(req.params.id);

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

// @desc    Verify fuel record
// @route   PATCH /api/fuel/:id/verify
// @access  Private
const verifyFuelRecord = asyncHandler(async (req, res) => {
    try {
        const { verifiedBy } = req.body;

        const verifiedFuel = await Fuel.findByIdAndUpdate(
            req.params.id,
            {
                isVerified: true,
                verifiedBy: verifiedBy,
                verifiedAt: new Date()
            },
            { new: true }
        ).populate('vehicleId', 'registration make model')
         .populate('verifiedBy', 'firstName lastName');

        if (!verifiedFuel) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Fuel record not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Fuel record verified successfully',
            data: verifiedFuel
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get fuel efficiency analytics
// @route   GET /api/fuel/analytics/efficiency
// @access  Private
const getFuelEfficiency = asyncHandler(async (req, res) => {
    try {
        const { vehicleId, startDate, endDate = new Date() } = req.query;
        
        if (!vehicleId || !startDate) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Vehicle ID and start date are required'
            });
        }

        const efficiency = await Fuel.calculateFuelEfficiency(vehicleId, startDate, endDate);

        if (!efficiency) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No fuel data found for the specified period'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: efficiency
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Detect fuel theft or inefficiencies
// @route   GET /api/fuel/analytics/theft-detection
// @access  Private
const detectFuelTheft = asyncHandler(async (req, res) => {
    try {
        const { vehicleId, startDate, endDate = new Date() } = req.query;
        
        // Get vehicle information
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Calculate actual fuel efficiency
        const actualEfficiency = await Fuel.calculateFuelEfficiency(vehicleId, startDate, endDate);
        
        if (!actualEfficiency) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No fuel data found for analysis'
            });
        }

        // Expected efficiency (could be from vehicle specs or historical average)
        const expectedEfficiency = vehicle.fuelEfficiency || 8.5;
        const efficiencyThreshold = 1.2;

        const efficiencyRatio = actualEfficiency.fuelEfficiency / expectedEfficiency;
        const isInefficient = efficiencyRatio > efficiencyThreshold;

        // Check for unusual fueling patterns
        const unusualPatterns = await checkUnusualPatterns(vehicleId, startDate, endDate);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                vehicle: vehicle.registration,
                actualEfficiency: actualEfficiency.fuelEfficiency,
                expectedEfficiency,
                efficiencyRatio,
                isInefficient,
                warning: isInefficient ? 'High fuel consumption detected' : 'Normal consumption',
                unusualPatterns,
                recommendations: isInefficient ? [
                    'Check for mechanical issues',
                    'Review driving patterns',
                    'Verify odometer readings'
                ] : ['Consumption within normal range']
            }
        });

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get fuel consumption report
// @route   GET /api/fuel/analytics/consumption
// @access  Private
const getFuelConsumption = asyncHandler(async (req, res) => {
    try {
        const { department, startDate, endDate = new Date() } = req.query;
        
        let matchStage = {
            fuelingDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        };
        
        if (department) {
            matchStage.department = new mongoose.Types.ObjectId(department); // FIXED: Added 'new'
        }

        const consumption = await Fuel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$vehicleId',
                    totalFuel: { $sum: '$fuelAmount' },
                    totalCost: { $sum: '$totalCost' },
                    averageCostPerLiter: { $avg: '$costPerUnit' }
                }
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            { $unwind: '$vehicle' }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: consumption
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get fuel cost analysis
// @route   GET /api/fuel/analytics/cost
// @access  Private
const getFuelCostAnalysis = asyncHandler(async (req, res) => {
    try {
        const { department, startDate, endDate = new Date() } = req.query;
        
        let matchStage = {
            fuelingDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        };
        
        if (department) {
            matchStage.department = new mongoose.Types.ObjectId(department); // FIXED: Added 'new'
        }

        const costAnalysis = await Fuel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$fuelingDate' },
                        month: { $month: '$fuelingDate' }
                    },
                    totalCost: { $sum: '$totalCost' },
                    totalFuel: { $sum: '$fuelAmount' },
                    averagePrice: { $avg: '$costPerUnit' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: costAnalysis
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get fuel summary report
// @route   GET /api/fuel/reports/summary
// @access  Private
const getFuelSummaryReport = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate = new Date() } = req.query;
        
        const summary = await Fuel.aggregate([
            {
                $match: {
                    fuelingDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    totalFuel: { $sum: '$fuelAmount' },
                    totalCost: { $sum: '$totalCost' },
                    averageEfficiency: { $avg: '$fuelAmount' }
                }
            }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: summary[0] || {}
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Sync fuel card data
// @route   POST /api/fuel/fuel-card/sync
// @access  Private
const syncFuelCardData = asyncHandler(async (req, res) => {
    try {
        const { transactions } = req.body;
        
        const syncedTransactions = [];
        const errors = [];

        for (const transaction of transactions) {
            try {
                const fuelRecord = await Fuel.create({
                    ...transaction,
                    fuelingType: 'routine',
                    isVerified: true,
                    recordedBy: req.user?.id || 'system'
                });
                syncedTransactions.push(fuelRecord);
            } catch (error) {
                errors.push({
                    transaction,
                    error: error.message
                });
            }
        }

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: `Synced ${syncedTransactions.length} transactions, ${errors.length} failed`,
            data: {
                synced: syncedTransactions,
                errors: errors
            }
        });

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get fuel card transactions
// @route   GET /api/fuel/fuel-card/transactions
// @access  Private
const getFuelCardTransactions = asyncHandler(async (req, res) => {
    try {
        const { fuelCardNumber, startDate, endDate } = req.query;
        
        let query = { fuelCardNumber: { $exists: true } };
        if (fuelCardNumber) query.fuelCardNumber = fuelCardNumber;
        if (startDate || endDate) {
            query.fuelingDate = {};
            if (startDate) query.fuelingDate.$gte = new Date(startDate);
            if (endDate) query.fuelingDate.$lte = new Date(endDate);
        }

        const transactions = await Fuel.find(query)
            .populate('vehicleId', 'registration make model')
            .sort({ fuelingDate: -1 });

        res.status(StatusCodes.OK).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    recordFuel,
    getAllFuelRecords,
    getFuelByVehicle,
    getFuelRecordById,
    updateFuelRecord,
    deleteFuelRecord,
    verifyFuelRecord,
    getFuelEfficiency,
    detectFuelTheft,
    getFuelConsumption,
    getFuelCostAnalysis,
    getFuelSummaryReport,
    syncFuelCardData,
    getFuelCardTransactions
};