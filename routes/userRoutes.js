const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/create-user', userController.createUser);
router.post('/create-driver', userController.createDriver);
router.post('/batch-create-users', userController.batchAddUsers);
router.post('/batch-create-drivers', userController.batchAddDrivers);
router.get('/get-users', userController.getUsers);
router.post('/all-drivers', userController.getAllDrivers);
router.get('/get-user/:id', userController.getUserById);
router.get('/department-drivers/:departmentId', userController.getDriversByDepartment);
router.post('/cartrack/batch-create-drivers', userController.batchAddDriversFromCartrack);
router.get('/getUserByEmail', userController.getUserByEmail);
router.put('/update-roles/:id', userController.updateUserRoles);
router.get('/role/:role', userController.getUsersByRole);

module.exports = router;