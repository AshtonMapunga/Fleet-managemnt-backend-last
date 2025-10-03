const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect, requirePermission, requireRole } = require('../middleware/authMiddleware');

// Auth routes (Public)
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Protected routes
router.use(protect);

// User profile routes
router.get('/me', authController.getMe);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.get('/permissions', userController.getUserPermissions);

// User management routes - Protected with permissions
router.post('/create-user', requirePermission('userManagement'), userController.createUser);
router.post('/create-driver', requirePermission('userManagement'), userController.createDriver);
router.post('/batch-create-users', requirePermission('userManagement'), userController.batchAddUsers);
router.post('/batch-create-drivers', requirePermission('userManagement'), userController.batchAddDrivers);

// GET routes for data retrieval
router.get('/get-users', requirePermission('userManagement'), userController.getUsers);
router.get('/all-drivers', userController.getAllDrivers);
router.get('/getUserByEmail', userController.getUserByEmail);

// Other routes with proper permission checks
router.get('/get-user/:id', userController.getUserById);
router.get('/department-drivers/:departmentId', userController.getDriversByDepartment);
router.post('/cartrack/batch-create-drivers', requirePermission('userManagement'), userController.batchAddDriversFromCartrack);
router.put('/update-roles/:id', requirePermission('userManagement'), userController.updateUserRoles);
router.get('/role/:role', requirePermission('userManagement'), userController.getUsersByRole);
router.put('/update/:id', userController.updateUser);
router.delete('/delete/:id', requirePermission('userManagement'), userController.deleteUser);

module.exports = router;