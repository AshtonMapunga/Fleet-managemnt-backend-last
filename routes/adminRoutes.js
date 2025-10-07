const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// All routes protected
router.use(protect);

// ==================== DASHBOARD ====================
router.get('/dashboard', requirePermission('dashboard'), adminController.getDashboardOverview);

// ==================== USER & DRIVER MANAGEMENT ====================
router.get('/users', requirePermission('userManagement'), adminController.getUsers);
router.post('/users', requirePermission('userManagement'), adminController.createUser);
router.put('/users/:id', requirePermission('userManagement'), adminController.updateUser); // ADD THIS LINE
router.patch('/users/:id/status', requirePermission('userManagement'), adminController.toggleUserStatus);
router.delete('/users/:id', requirePermission('userManagement'), adminController.deleteUser);

// ==================== VEHICLE MANAGEMENT ====================
router.get('/vehicles', requirePermission('vehicleManagement'), adminController.getVehicles);
router.post('/vehicles', requirePermission('vehicleManagement'), adminController.createVehicle);
router.put('/vehicles/:id', requirePermission('vehicleManagement'), adminController.updateVehicle);
router.patch('/vehicles/:id/assign', requirePermission('vehicleManagement'), adminController.assignVehicle);
router.patch('/vehicles/:id/retire', requirePermission('vehicleManagement'), adminController.retireVehicle);
router.delete('/vehicles/:id', requirePermission('vehicleManagement'), adminController.deleteVehicle);

// ==================== TRIP MANAGEMENT ====================
router.get('/trips', requirePermission('tripManagement'), adminController.getTrips);
router.post('/trips', requirePermission('tripManagement'), adminController.createTrip);
router.patch('/trips/:id/status', requirePermission('tripManagement'), adminController.updateTripStatus);
router.patch('/trips/:id/reassign', requirePermission('tripManagement'), adminController.reassignTrip);
router.patch('/trips/:id/cancel', requirePermission('tripManagement'), adminController.cancelTrip);
router.delete('/trips/:id', requirePermission('tripManagement'), adminController.deleteTrip);

// ==================== MAINTENANCE MANAGEMENT ====================
router.get('/maintenance', requirePermission('maintenanceManagement'), adminController.getMaintenance);
router.post('/maintenance', requirePermission('maintenanceManagement'), adminController.scheduleMaintenance);
router.put('/maintenance/:id', requirePermission('maintenanceManagement'), adminController.updateMaintenance);
router.patch('/maintenance/:id/complete', requirePermission('maintenanceManagement'), adminController.completeMaintenance);
router.delete('/maintenance/:id', requirePermission('maintenanceManagement'), adminController.deleteMaintenance);

// ==================== FUEL & EXPENSE MANAGEMENT ====================
router.get('/fuel', requirePermission('fuelManagement'), adminController.getFuelRecords);
router.post('/fuel', requirePermission('fuelManagement'), adminController.addFuelRecord);
router.put('/fuel/:id', requirePermission('fuelManagement'), adminController.updateFuelRecord);
router.patch('/fuel/:id/verify', requirePermission('fuelManagement'), adminController.verifyFuelExpense);
router.delete('/fuel/:id', requirePermission('fuelManagement'), adminController.deleteFuelRecord);

// ==================== ANALYTICS ====================
router.get('/analytics', requirePermission('analytics'), adminController.getAnalytics);

// ==================== COMPLIANCE & SAFETY ====================
router.get('/compliance', requirePermission('compliance'), adminController.getComplianceSafety);

// ==================== SYSTEM & ACCESS CONTROL ====================
router.get('/system', requirePermission('systemSettings'), adminController.getSystemAccess);

module.exports = router;