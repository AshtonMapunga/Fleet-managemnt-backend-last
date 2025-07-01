const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create department
// @route   POST /api/departments/addDepartment
// @access  Private
const createDepartment = asyncHandler(async (req, res) => {
    const { departmentName, departmentDescription, departmentHead, allocatedFunds, availableFunds, subsidiary } = req.body;

    const department = await Department.create({
        departmentName,
        departmentDescription,
        departmentHead,
        allocatedFunds,
        availableFunds,
        subsidiary
    });

    res.status(StatusCodes.CREATED).json(department);
});

// @desc    Get all departments
// @route   GET /api/departments/all-departments
// @access  Private
const getAllDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({})
        .populate('departmentHead', 'firstName lastName')
        .populate('subsidiary', 'subsidiaryName');

    res.status(StatusCodes.OK).json(departments);
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

    res.status(StatusCodes.OK).json(department);
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
        allocatedFunds: department.allocatedFunds,
        availableFunds: department.availableFunds
    });
});

// @desc    Edit department
// @route   PUT /api/departments/editDepartment
// @access  Private
const editDepartment = asyncHandler(async (req, res) => {
    const { departmentId } = req.query;
    const { departmentName, departmentDescription } = req.body;

    const department = await Department.findByIdAndUpdate(
        departmentId,
        { departmentName, departmentDescription },
        { new: true, runValidators: true }
    );

    if (!department) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('Department not found');
    }

    res.status(StatusCodes.OK).json(department);
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

    res.status(StatusCodes.OK).json(department);
});

module.exports = {
    createDepartment,
    getAllDepartments,
    updateDepartmentBudget,
    getDepartmentBudget,
    editDepartment,
    deductFunds,
};