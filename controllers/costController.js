const Cost = require('../models/Cost');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Record cost
// @route   POST /api/cost-management/create
// @access  Private
const recordCost = asyncHandler(async (req, res) => {
    const { amount, category, department, description, incurredDate, relatedVehicle, relatedDriver, costId } = req.body;

    const cost = await Cost.create({
        amount,
        category,
        department,
        description,
        incurredDate,
        relatedVehicle,
        relatedDriver,
        costId
    });

    res.status(StatusCodes.CREATED).json(cost);
});

// @desc    Get all costs
// @route   GET /api/cost-management/getAllCosts
// @access  Private
const getAllCosts = asyncHandler(async (req, res) => {
    const costs = await Cost.find({})
        .populate('department', 'departmentName')
        .populate('relatedVehicle', 'vehicleReg make model')
        .populate('relatedDriver', 'firstName lastName');

    res.status(StatusCodes.OK).json(costs);
});

// @desc    Get costs by department
// @route   GET /api/cost-management/getCostsByDepartment
// @access  Private
const getCostsByDepartment = asyncHandler(async (req, res) => {
    const { department } = req.query;

    const costs = await Cost.find({ department })
        .populate('relatedVehicle', 'vehicleReg make model')
        .populate('relatedDriver', 'firstName lastName');

    res.status(StatusCodes.OK).json(costs);
});

// @desc    Get costs by category
// @route   GET /api/cost-management/getCostsByCategory
// @access  Private
const getCostsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const costs = await Cost.find({ category })
        .populate('department', 'departmentName')
        .populate('relatedVehicle', 'vehicleReg make model')
        .populate('relatedDriver', 'firstName lastName');

    res.status(StatusCodes.OK).json(costs);
});

// @desc    Get costs by related vehicle
// @route   GET /api/cost-management/getCostsByAssociatedVihicle
// @access  Private
const getCostsByRelatedVehicle = asyncHandler(async (req, res) => {
    const { relatedVehicle } = req.query;

    const costs = await Cost.find({ relatedVehicle })
        .populate('department', 'departmentName')
        .populate('relatedDriver', 'firstName lastName');

    res.status(StatusCodes.OK).json(costs);
});

module.exports = {
    recordCost,
    getAllCosts,
    getCostsByDepartment,
    getCostsByCategory,
    getCostsByRelatedVehicle,
};