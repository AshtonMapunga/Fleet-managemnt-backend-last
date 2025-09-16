const Shuttle = require('../models/Shuttle');

const shuttleController = {
    // Create a new shuttle
    createShuttle: async (req, res, next) => {
        try {
            const shuttleData = req.body;
            const newShuttle = new Shuttle(shuttleData);
            const savedShuttle = await newShuttle.save();
            res.status(201).json({
                success: true,
                message: 'Shuttle created successfully',
                data: savedShuttle
            });
        } catch (error) {
            next(error);
        }
    },

    // Get all shuttles
    getAllShuttles: async (req, res, next) => {
        try {
            const shuttles = await Shuttle.find().populate('department', 'name');  // CHANGED departmentId to department
            res.status(200).json({
                success: true,
                count: shuttles.length,
                data: shuttles
            });
        } catch (error) {
            next(error);
        }
    },

    // Get shuttle by ID
    getShuttleById: async (req, res, next) => {
        try {
            const shuttle = await Shuttle.findById(req.params.id).populate('department', 'name');  // CHANGED departmentId to department
            if (!shuttle) {
                return res.status(404).json({
                    success: false,
                    message: 'Shuttle not found'
                });
            }
            res.status(200).json({
                success: true,
                data: shuttle
            });
        } catch (error) {
            next(error);
        }
    },

    // Update shuttle
    updateShuttle: async (req, res, next) => {
        try {
            const updatedShuttle = await Shuttle.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedShuttle) {
                return res.status(404).json({
                    success: false,
                    message: 'Shuttle not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Shuttle updated successfully',
                data: updatedShuttle
            });
        } catch (error) {
            next(error);
        }
    },

    // Delete shuttle
    deleteShuttle: async (req, res, next) => {
        try {
            const shuttle = await Shuttle.findByIdAndDelete(req.params.id);
            if (!shuttle) {
                return res.status(404).json({
                    success: false,
                    message: 'Shuttle not found'
                });
            }
            res.status(200).json({
                success: true,
                message: 'Shuttle deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // Get shuttles by status
    getShuttlesByStatus: async (req, res, next) => {
        try {
            const shuttles = await Shuttle.find({ status: req.params.status });
            res.status(200).json({
                success: true,
                count: shuttles.length,
                data: shuttles
            });
        } catch (error) {
            next(error);
        }
    },

    // Get shuttles by department
    getShuttlesByDepartment: async (req, res, next) => {
        try {
            const shuttles = await Shuttle.find({ department: req.params.departmentId });  // CHANGED departmentId to department
            res.status(200).json({
                success: true,
                count: shuttles.length,
                data: shuttles
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = shuttleController;