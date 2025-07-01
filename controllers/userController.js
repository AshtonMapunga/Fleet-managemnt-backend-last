const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');

// @desc    Create user
// @route   POST /api/user/create-user
// @access  Private
const createUser = asyncHandler(async (req, res) => {
    const { employeeNumber, email, firstName, lastName, grade, department, isAdmin, isDriver, isApprover, isBayManager, isLineManager } = req.body;

    const user = await User.create({
        employeeNumber,
        email,
        firstName,
        lastName,
        grade,
        department,
        isAdmin,
        isDriver,
        isApprover,
        isBayManager,
        isLineManager
    });

    res.status(StatusCodes.CREATED).json(user);
});

// @desc    Create driver
// @route   POST /api/user/create-driver
// @access  Private
const createDriver = asyncHandler(async (req, res) => {
    const { employeeNumber, email, firstName, lastName, grade, department } = req.body;

    const driver = await User.create({
        employeeNumber,
        email,
        firstName,
        lastName,
        grade,
        department,
        isDriver: true
    });

    res.status(StatusCodes.CREATED).json(driver);
});

// @desc    Batch add users
// @route   POST /api/user/batch-create-users
// @access  Private
const batchAddUsers = asyncHandler(async (req, res) => {
    const { users } = req.body;

    const createdUsers = await User.insertMany(users);
    res.status(StatusCodes.CREATED).json(createdUsers);
});

// @desc    Batch add drivers
// @route   POST /api/user/batch-create-drivers
// @access  Private
const batchAddDrivers = asyncHandler(async (req, res) => {
    const { employeeNumber, email, firstName, lastName, grade, department } = req.body;

    const driver = await User.create({
        employeeNumber,
        email,
        firstName,
        lastName,
        grade,
        department,
        isDriver: true
    });

    res.status(StatusCodes.CREATED).json(driver);
});

// @desc    Get all users
// @route   GET /api/user/get-users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
        .populate('department', 'departmentName');

    res.status(StatusCodes.OK).json(users);
});

// @desc    Get all drivers
// @route   POST /api/user/all-drivers
// @access  Private
const getAllDrivers = asyncHandler(async (req, res) => {
    const { departmentId } = req.body;

    let query = { isDriver: true };
    if (departmentId) {
        query.department = departmentId;
    }

    const drivers = await User.find(query)
        .populate('department', 'departmentName');

    res.status(StatusCodes.OK).json(drivers);
});

// @desc    Get user by ID
// @route   GET /api/user/get-user/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('department', 'departmentName');

    if (!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User not found');
    }

    res.status(StatusCodes.OK).json(user);
});

// @desc    Get drivers by department
// @route   GET /api/user/department-drivers/:departmentId
// @access  Private
const getDriversByDepartment = asyncHandler(async (req, res) => {
    const drivers = await User.find({
        department: req.params.departmentId,
        isDriver: true
    }).populate('department', 'departmentName');

    res.status(StatusCodes.OK).json(drivers);
});

// @desc    Batch add drivers from Cartrack
// @route   POST /api/user/cartrack/batch-create-drivers
// @access  Private
const batchAddDriversFromCartrack = asyncHandler(async (req, res) => {
    const { users } = req.body;

    const createdDrivers = await User.insertMany(users.map(u => ({
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phoneNumber: u.phone_number,
        isDriver: true,
        status: u.status
    })));

    res.status(StatusCodes.CREATED).json(createdDrivers);
});

// @desc    Get user by email
// @route   GET /api/user/getUserByEmail
// @access  Private
const getUserByEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    const user = await User.findOne({ email })
        .populate('department', 'departmentName');

    if (!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User not found');
    }

    res.status(StatusCodes.OK).json(user);
});


// Add to existing userController
// @desc    Update user roles
// @route   PUT /api/user/update-roles/:id
// @access  Private (Admin only)
const updateUserRoles = asyncHandler(async (req, res) => {
    const { isAdmin, isDriver, isApprover, isBayManager, isLineManager } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isAdmin, isDriver, isApprover, isBayManager, isLineManager },
        { new: true, runValidators: true }
    );

    if (!user) {
        res.status(StatusCodes.NOT_FOUND);
        throw new Error('User not found');
    }

    res.status(StatusCodes.OK).json(user);
});

// @desc    Get users by role
// @route   GET /api/user/role/:role
// @access  Private
const getUsersByRole = asyncHandler(async (req, res) => {
    const { role } = req.params;
    const validRoles = ['admin', 'driver', 'approver', 'bayManager', 'lineManager'];

    if (!validRoles.includes(role)) {
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error('Invalid role specified');
    }

    const query = { [`is${role.charAt(0).toUpperCase() + role.slice(1)}`]: true };
    const users = await User.find(query)
        .populate('department', 'departmentName');

    res.status(StatusCodes.OK).json(users);
});



module.exports = {
    createUser,
    createDriver,
    batchAddUsers,
    batchAddDrivers,
    getUsers,
    getAllDrivers,
    getUserById,
    getDriversByDepartment,
    batchAddDriversFromCartrack,
    getUserByEmail,
    updateUserRoles,
    getUsersByRole
};