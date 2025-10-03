const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');

// @desc    Register new user
// @route   POST /api/user/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { employeeNumber, email, password, firstName, lastName, phone, department } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ 
            $or: [{ email }, { employeeNumber }] 
        });

        if (userExists) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'User already exists with this email or employee number'
            });
        }

        // Get default permissions for user role
        const defaultPermissions = User.getDefaultPermissions('user');

        // Create user
        const user = await User.create({
            employeeNumber,
            email,
            password,
            firstName,
            lastName,
            phone,
            department,
            role: 'user',
            permissions: defaultPermissions,
            status: 'Active'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'User registered successfully',
            token,
            data: {
                _id: user._id,
                employeeNumber: user.employeeNumber,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                department: user.department,
                permissions: user.permissions
            }
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/user/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (user.status !== 'Active') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Compare passwords using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Generate token
        const token = generateToken(user._id);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                _id: user._id,
                employeeNumber: user.employeeNumber,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                department: user.department,
                permissions: user.permissions,
                departmentAccess: user.departmentAccess,
                subsidiaryAccess: user.subsidiaryAccess,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// @desc    Get current logged in user
// @route   GET /api/user/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('department', 'name')
            .populate('departmentAccess', 'name')
            .populate('subsidiaryAccess', 'name')
            .select('-password');

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

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, phone, licenseNumber, licenseExpiry } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 
                firstName, 
                lastName, 
                phone, 
                licenseNumber, 
                licenseExpiry 
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword
};