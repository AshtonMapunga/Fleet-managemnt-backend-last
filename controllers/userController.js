const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');

// @desc    Create user
// @route   POST /api/user/create-user
// @access  Private (Admin only)
const createUser = asyncHandler(async (req, res) => {
    try {
        const { 
            employeeNumber, email, password, firstName, lastName, grade, department, 
            role, permissions, departmentAccess, subsidiaryAccess, phone, licenseNumber, licenseExpiry 
        } = req.body;

        // Check if user has permission to create users
        if (!req.user.hasPermission('userManagement') && req.user.role !== 'super-admin') {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to create users'
            });
        }

        // Get default permissions for the role
        const defaultPermissions = User.getDefaultPermissions(role || 'user');
        const finalPermissions = { ...defaultPermissions, ...permissions };

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
            role: role || 'user',
            permissions: finalPermissions,
            departmentAccess: departmentAccess || [],
            subsidiaryAccess: subsidiaryAccess || [],
            phone,
            licenseNumber,
            licenseExpiry,
            // Legacy fields for backward compatibility
            isAdmin: role === 'admin' || role === 'super-admin',
            isDriver: role === 'driver',
            status: 'Active'
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
// @access  Private (Admin/Fleet Manager)
const createDriver = asyncHandler(async (req, res) => {
    try {
        const { employeeNumber, email, password, firstName, lastName, grade, department, licenseNumber, licenseExpiry, phone } = req.body;

        // Check permissions
        if (!req.user.hasPermission('userManagement') && !req.user.hasPermission('vehicleManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to create drivers'
            });
        }

        // Get default permissions for driver role
        const defaultPermissions = User.getDefaultPermissions('driver');

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
            licenseExpiry,
            phone,
            role: 'driver',
            permissions: defaultPermissions,
            // Legacy fields
            isDriver: true
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
// @access  Private (Admin only)
const batchAddUsers = asyncHandler(async (req, res) => {
    try {
        const { users } = req.body;

        // Check permissions
        if (!req.user.hasPermission('userManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to batch create users'
            });
        }

        // Hash passwords for all users and set default permissions
        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 12);
                const defaultPermissions = User.getDefaultPermissions(user.role || 'user');
                
                return {
                    ...user,
                    password: hashedPassword,
                    permissions: { ...defaultPermissions, ...user.permissions },
                    departmentAccess: user.departmentAccess || [],
                    subsidiaryAccess: user.subsidiaryAccess || [],
                    // Legacy fields
                    isAdmin: user.role === 'admin' || user.role === 'super-admin',
                    isDriver: user.role === 'driver'
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
// @access  Private (Admin/Fleet Manager)
const batchAddDrivers = asyncHandler(async (req, res) => {
    try {
        const { drivers } = req.body;

        // Check permissions
        if (!req.user.hasPermission('userManagement') && !req.user.hasPermission('vehicleManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to batch create drivers'
            });
        }

        // Get default permissions for driver role
        const defaultPermissions = User.getDefaultPermissions('driver');

        // Hash passwords for all drivers
        const driversWithHashedPasswords = await Promise.all(
            drivers.map(async (driver) => {
                const hashedPassword = await bcrypt.hash(driver.password, 12);
                return {
                    ...driver,
                    password: hashedPassword,
                    permissions: defaultPermissions,
                    role: 'driver',
                    // Legacy fields
                    isDriver: true
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
// @access  Private (Admin/User Management)
const getUsers = asyncHandler(async (req, res) => {
    try {
        // Check permissions
        if (!req.user.hasPermission('userManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to view users'
            });
        }

        const users = await User.find({})
            .populate('department', 'name')
            .populate('departmentAccess', 'name')
            .populate('subsidiaryAccess', 'name')
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

// @desc    Get all drivers
// @route   GET /api/user/all-drivers
// @access  Private
const getAllDrivers = asyncHandler(async (req, res) => {
    try {
        const { departmentId } = req.query;

        let query = { role: 'driver' };
        
        // Apply department filter if user has department restrictions
        if (departmentId && !req.user.canAccessDepartment(departmentId)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied for this department'
            });
        }
        
        if (departmentId) {
            query.department = departmentId;
        } else if (req.user.departmentAccess.length > 0) {
            // Filter by user's accessible departments
            query.department = { $in: req.user.departmentAccess };
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
            .populate('departmentAccess', 'name')
            .populate('subsidiaryAccess', 'name')
            .select('-password');

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check department access
        if (!req.user.canAccessDepartment(user.department)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied for this user\'s department'
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
        const departmentId = req.params.departmentId;

        // Check department access
        if (!req.user.canAccessDepartment(departmentId)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied for this department'
            });
        }

        const drivers = await User.find({
            department: departmentId,
            role: 'driver'
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
// @access  Private (Admin/Fleet Manager)
const batchAddDriversFromCartrack = asyncHandler(async (req, res) => {
    try {
        const { users } = req.body;

        // Check permissions
        if (!req.user.hasPermission('userManagement') && !req.user.hasPermission('vehicleManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to import drivers'
            });
        }

        // Get default permissions for driver role
        const defaultPermissions = User.getDefaultPermissions('driver');

        // Create drivers with default password and permissions
        const driversToCreate = users.map(u => ({
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phone: u.phone_number,
            password: 'defaultPassword123',
            role: 'driver',
            permissions: defaultPermissions,
            status: u.status || 'Active',
            // Legacy fields
            isDriver: true
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

        // Check department access
        if (!req.user.canAccessDepartment(user.department)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Access denied for this user\'s department'
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

// @desc    Update user roles and permissions
// @route   PUT /api/user/update-roles/:id
// @access  Private (Admin only)
const updateUserRoles = asyncHandler(async (req, res) => {
    try {
        const { role, permissions, departmentAccess, subsidiaryAccess } = req.body;

        // Check permissions
        if (!req.user.hasPermission('userManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to update user roles'
            });
        }

        // Get default permissions for the new role
        const defaultPermissions = User.getDefaultPermissions(role);
        const finalPermissions = { ...defaultPermissions, ...permissions };

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                role,
                permissions: finalPermissions,
                departmentAccess,
                subsidiaryAccess,
                // Update legacy fields for backward compatibility
                isAdmin: role === 'admin' || role === 'super-admin',
                isDriver: role === 'driver'
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
            message: 'User roles and permissions updated successfully',
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
// @access  Private (Admin/User Management)
const getUsersByRole = asyncHandler(async (req, res) => {
    try {
        const { role } = req.params;
        const validRoles = ['super-admin', 'admin', 'fleet-manager', 'dispatcher', 'driver', 'viewer', 'user'];

        if (!validRoles.includes(role)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Check permissions
        if (!req.user.hasPermission('userManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to view users by role'
            });
        }

        const users = await User.find({ role })
            .populate('department', 'name')
            .populate('departmentAccess', 'name')
            .populate('subsidiaryAccess', 'name')
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
// @access  Private (Admin/User Management)
const updateUser = asyncHandler(async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // Check if user is updating their own profile or has permissions
        if (req.params.id !== req.user._id.toString() && !req.user.hasPermission('userManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to update this user'
            });
        }

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
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
    try {
        // Check permissions
        if (!req.user.hasPermission('userManagement')) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions to delete users'
            });
        }

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

// @desc    Get user permissions
// @route   GET /api/user/permissions
// @access  Private
const getUserPermissions = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('permissions role');
        
        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                permissions: user.permissions,
                role: user.role
            }
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
    deleteUser,
    getUserPermissions
};