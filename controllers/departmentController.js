const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create department
// @route   POST /api/departments/create
// @access  Private
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description, departmentHead, allocatedFunds, availableFunds, subsidiary } = req.body;

    const department = await Department.create({
        departmentName: name,
        departmentDescription: description,
        departmentHead,
        allocatedFunds,
        availableFunds,
        subsidiary
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: department
    });
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getAllDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({})
        .populate('departmentHead', 'firstName lastName')
        .populate('subsidiary', 'subsidiaryName');

    res.status(StatusCodes.OK).json({
        success: true,
        count: departments.length,
        data: departments
    });
});

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const department = await Department.findById(id)
        .populate('departmentHead', 'firstName lastName')
        .populate('subsidiary', 'subsidiaryName');

    if (!department) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Department not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: department
    });
});

// @desc    Update department budget
// @route   PUT /api/departments/updateBudget
// @access  Private
const updateDepartmentBudget = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const { budget } = req.body;

    const department = await Department.findByIdAndUpdate(
        departmentId,
        { allocatedFunds: budget, availableFunds: budget },
        { new: true, runValidators: true }
    );

    if (!department) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Department not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: department
    });
});

// @desc    Get department budget
// @route   GET /api/departments/getBudget
// @access  Private
const getDepartmentBudget = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;

    const department = await Department.findById(departmentId)
        .select('allocatedFunds availableFunds');

    if (!department) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Department not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            allocatedFunds: department.allocatedFunds,
            availableFunds: department.availableFunds
        }
    });
});

// @desc    Edit department
// @route   PUT /api/departments/editDepartment
// @access  Private
const editDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const { name, description } = req.body;

    const department = await Department.findByIdAndUpdate(
        departmentId,
        { 
            departmentName: name, 
            departmentDescription: description 
        },
        { new: true, runValidators: true }
    );

    if (!department) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Department not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: department
    });
});

// @desc    Deduct funds from department
// @route   PUT /api/departments/deductFunds
// @access  Private
const deductFunds = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const { amount } = req.body;

    const department = await Department.findById(departmentId);

    if (!department) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Department not found');
    }

    if (department.availableFunds < amount) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Insufficient funds');
    }

    department.availableFunds -= amount;
    await department.save();

    res.status(StatusCodes.OK).json({
        success: true,
        data: department
    });
});

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartmentBudget,
    getDepartmentBudget,
    editDepartment,
    deductFunds,
};