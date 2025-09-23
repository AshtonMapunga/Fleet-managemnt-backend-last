const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Auth routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/me', authController.getMe);

// User management routes - UPDATED TO USE PROPER HTTP METHODS
router.post('/create-user', userController.createUser);
router.post('/create-driver', userController.createDriver);
router.post('/batch-create-users', userController.batchAddUsers);
router.post('/batch-create-drivers', userController.batchAddDrivers);

// GET routes for data retrieval - CHANGED FROM POST TO GET
router.get('/get-users', userController.getUsers);
router.get('/all-drivers', userController.getAllDrivers); // CHANGED FROM POST TO GET
router.get('/getUserByEmail', userController.getUserByEmail);

// Other routes
router.get('/get-user/:id', userController.getUserById);
router.get('/department-drivers/:departmentId', userController.getDriversByDepartment);
router.post('/cartrack/batch-create-drivers', userController.batchAddDriversFromCartrack);
router.put('/update-roles/:id', userController.updateUserRoles);
router.get('/role/:role', userController.getUsersByRole);
router.put('/update/:id', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;