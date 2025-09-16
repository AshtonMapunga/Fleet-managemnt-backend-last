// controllers/parkingController.js
const Parking = require('../models/Parking'); // You'll need to create this model

const parkingController = {
    // Record parking
    recordParking: async (req, res, next) => {
        try {
            const parkingData = req.body;
            const newParking = new Parking(parkingData);
            const savedParking = await newParking.save();
            res.status(201).json({
                success: true,
                message: 'Parking recorded successfully',
                data: savedParking
            });
        } catch (error) {
            next(error);
        }
    },

    // Get all parking records
    getAllParkingRecords: async (req, res, next) => {
        try {
            const parkingRecords = await Parking.find()
                .populate('vehicleId', 'registration make model')
                .populate('shuttleId', 'name registration')
                .populate('recordedBy', 'name email');
            res.status(200).json({
                success: true,
                count: parkingRecords.length,
                data: parkingRecords
            });
        } catch (error) {
            next(error);
        }
    },

    // Get parking by vehicle
    getParkingByVehicle: async (req, res, next) => {
        try {
            const parkingRecords = await Parking.find({ vehicleId: req.params.vehicleId })
                .populate('vehicleId', 'registration make model');
            res.status(200).json({
                success: true,
                count: parkingRecords.length,
                data: parkingRecords
            });
        } catch (error) {
            next(error);
        }
    },

    // Get parking by shuttle
    getParkingByShuttle: async (req, res, next) => {
        try {
            const parkingRecords = await Parking.find({ shuttleId: req.params.shuttleId })
                .populate('shuttleId', 'name registration');
            res.status(200).json({
                success: true,
                count: parkingRecords.length,
                data: parkingRecords
            });
        } catch (error) {
            next(error);
        }
    },

    // Get parking record by ID
    getParkingRecordById: async (req, res, next) => {
        try {
            const parkingRecord = await Parking.findById(req.params.id)
                .populate('vehicleId', 'registration make model')
                .populate('shuttleId', 'name registration')
                .populate('recordedBy', 'name email');
            if (!parkingRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking record not found'
                });
            }
            res.status(200).json({
                success: true,
                data: parkingRecord
            });
        } catch (error) {
            next(error);
        }
    },

    // Update parking record
    updateParkingRecord: async (req, res, next) => {
        try {
            const updatedParking = await Parking.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedParking) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking record not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Parking record updated successfully',
                data: updatedParking
            });
        } catch (error) {
            next(error);
        }
    },

    // Delete parking record
    deleteParkingRecord: async (req, res, next) => {
        try {
            const parkingRecord = await Parking.findByIdAndDelete(req.params.id);
            if (!parkingRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Parking record not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Parking record deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // Get parking duration analysis
    getParkingDurationAnalysis: async (req, res, next) => {
        try {
            // This is a simple example - you can make this more complex
            const analysis = await Parking.aggregate([
                {
                    $group: {
                        _id: null,
                        averageDuration: { $avg: "$durationHours" },
                        totalRecords: { $sum: 1 },
                        totalParkingHours: { $sum: "$durationHours" }
                    }
                }
            ]);
            res.status(200).json({
                success: true,
                data: analysis[0] || {}
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = parkingController;