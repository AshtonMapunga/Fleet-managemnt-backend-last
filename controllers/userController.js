const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');

// @desc    Create user
// @route   POST /api/user/create-user
// @access  Private
const createUser = asyncHandler(async (req, res) => {
    try {
        const { employeeNumber, email, password, firstName, lastName, grade, department, isAdmin, isDriver, isApprover, isBayManager, isLineManager } = req.body;

        // Hash password before creating user
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            employeeNumber,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            grade,
            department,
            isAdmin: isAdmin || false,
            isDriver: isDriver || false,
            isApprover: isApprover || false,
            isBayManager: isBayManager || false,
            isLineManager: isLineManager || false
        });

        // Remove password from response
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

// @desc    Create driver
// @route   POST /api/user/create-driver
// @access  Private
const createDriver = asyncHandler(async (req, res) => {
    try {
        const { employeeNumber, email, password, firstName, lastName, grade, department, licenseNumber } = req.body;

        // Hash password before creating driver
        const hashedPassword = await bcrypt.hash(password, 12);

        const driver = await User.create({
            employeeNumber,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            grade,
            department,
            licenseNumber,
            isDriver: true,
            role: 'driver'
        });

        // Remove password from response
        const driverResponse = driver.toObject();
        delete driverResponse.password;

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Driver created successfully',
            data: driverResponse
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Batch add users
// @route   POST /api/user/batch-create-users
// @access  Private
const batchAddUsers = asyncHandler(async (req, res) => {
    try {
        const { users } = req.body;

        // Hash passwords for all users
        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 12);
                return {
                    ...user,
                    password: hashedPassword
                };
            })
        );

        const createdUsers = await User.insertMany(usersWithHashedPasswords);

        // Remove passwords from response
        const usersResponse = createdUsers.map(user => {
            const userObj = user.toObject();
            delete userObj.password;
            return userObj;
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Users created successfully',
            data: usersResponse
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Batch add drivers
// @route   POST /api/user/batch-create-drivers
// @access  Private
const batchAddDrivers = asyncHandler(async (req, res) => {
    try {
        const { drivers } = req.body;

        // Hash passwords for all drivers
        const driversWithHashedPasswords = await Promise.all(
            drivers.map(async (driver) => {
                const hashedPassword = await bcrypt.hash(driver.password, 12);
                return {
                    ...driver,
                    password: hashedPassword,
                    isDriver: true,
                    role: 'driver'
                };
            })
        );

        const createdDrivers = await User.insertMany(driversWithHashedPasswords);

        // Remove passwords from response
        const driversResponse = createdDrivers.map(driver => {
            const driverObj = driver.toObject();
            delete driverObj.password;
            return driverObj;
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Drivers created successfully',
            data: driversResponse
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all users
// @route   GET /api/user/get-users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({})
            .populate('department', 'name')
            .select('-password');

        res.status(StatusCodes.OK).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all drivers - UPDATED TO USE GET AND QUERY PARAMS
// @route   GET /api/user/all-drivers
// @access  Private
const getAllDrivers = asyncHandler(async (req, res) => {
    try {
        // Use query parameters instead of request body for GET
        const { departmentId } = req.query;

        let query = { isDriver: true };
        if (departmentId) {
            query.department = departmentId;
        }

        const drivers = await User.find(query)
            .populate('department', 'name')
            .select('-password');

        res.status(StatusCodes.OK).json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get user by ID
// @route   GET /api/user/get-user/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('department', 'name')
            .select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get drivers by department
// @route   GET /api/user/department-drivers/:departmentId
// @access  Private
const getDriversByDepartment = asyncHandler(async (req, res) => {
    try {
        const drivers = await User.find({
            department: req.params.departmentId,
            isDriver: true
        })
        .populate('department', 'name')
        .select('-password');

        res.status(StatusCodes.OK).json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Batch add drivers from Cartrack
// @route   POST /api/user/cartrack/batch-create-drivers
// @access  Private
const batchAddDriversFromCartrack = asyncHandler(async (req, res) => {
    try {
        const { users } = req.body;

        // Create drivers with default password
        const driversToCreate = users.map(u => ({
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phoneNumber: u.phone_number,
            password: 'defaultPassword123',
            isDriver: true,
            status: u.status || 'Active',
            role: 'driver'
        }));

        // Hash passwords for all drivers
        const driversWithHashedPasswords = await Promise.all(
            driversToCreate.map(async (driver) => {
                const hashedPassword = await bcrypt.hash(driver.password, 12);
                return {
                    ...driver,
                    password: hashedPassword
                };
            })
        );

        const createdDrivers = await User.insertMany(driversWithHashedPasswords);

        // Remove passwords from response
        const driversResponse = createdDrivers.map(driver => {
            const driverObj = driver.toObject();
            delete driverObj.password;
            return driverObj;
        });

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Drivers imported successfully',
            data: driversResponse
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get user by email
// @route   GET /api/user/getUserByEmail
// @access  Private
const getUserByEmail = asyncHandler(async (req, res) => {
    try {
        const { email } = req.query;

        const user = await User.findOne({ email })
            .populate('department', 'name')
            .select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update user roles
// @route   PUT /api/user/update-roles/:id
// @access  Private
const updateUserRoles = asyncHandler(async (req, res) => {
    try {
        const { isAdmin, isDriver, isApprover, isBayManager, isLineManager } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                isAdmin, 
                isDriver, 
                isApprover, 
                isBayManager, 
                isLineManager,
                role: isAdmin ? 'admin' : isDriver ? 'driver' : 'user'
            },
            { new: true, runValidators: true }
        )
        .select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User roles updated successfully',
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get users by role
// @route   GET /api/user/role/:role
// @access  Private
const getUsersByRole = asyncHandler(async (req, res) => {
    try {
        const { role } = req.params;
        const validRoles = ['admin', 'driver', 'approver', 'bayManager', 'lineManager'];

        if (!validRoles.includes(role)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        let query = {};
        if (role === 'admin') {
            query.isAdmin = true;
        } else if (role === 'driver') {
            query.isDriver = true;
        } else if (role === 'approver') {
            query.isApprover = true;
        } else if (role === 'bayManager') {
            query.isBayManager = true;
        } else if (role === 'lineManager') {
            query.isLineManager = true;
        }

        const users = await User.find(query)
            .populate('department', 'name')
            .select('-password');

        res.status(StatusCodes.OK).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/user/update/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // If password is being updated, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
        .select('-password');

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

// @desc    Delete user
// @route   DELETE /api/user/delete/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

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
    getUsersByRole,
    updateUser,
    deleteUser
};