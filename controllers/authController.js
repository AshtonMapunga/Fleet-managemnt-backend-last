const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "User registered successfully"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               data:
 *                 _id: "65a1b2c3d4e5f6a7b8c9d0e1"
 *                 employeeNumber: "EMP001"
 *                 email: "user@company.com"
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 role: "user"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '30d',
        });

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

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "super@admin.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               data:
 *                 _id: "65a1b2c3d4e5f6a7b8c9d0e1"
 *                 employeeNumber: "SUPER001"
 *                 email: "super@admin.com"
 *                 firstName: "Super"
 *                 lastName: "Admin"
 *                 role: "super-admin"
 *                 permissions:
 *                   dashboard: true
 *                   userManagement: true
 *                   vehicleManagement: true
 *                   tripManagement: true
 *                   maintenanceManagement: true
 *                   fuelManagement: true
 *                   analytics: true
 *                   compliance: true
 *                   systemSettings: true
 *                   communication: true
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */
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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '30d',
        });

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

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
const getMe = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('department', 'name')
            .populate('departmentAccess', 'name')
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

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               licenseNumber:
 *                 type: string
 *               licenseExpiry:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
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