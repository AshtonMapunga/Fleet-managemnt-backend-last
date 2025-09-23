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
                department: user.department
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
// @access  Public
const getMe = asyncHandler(async (req, res) => {
    try {
        res.status(StatusCodes.OK).json({
            success: true,
            message: 'User profile endpoint'
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
    getMe
};