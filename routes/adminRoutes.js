// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requirePermission, requireRole } = require('../middleware/authMiddleware');

// All routes protected and require admin role
router.use(protect);
router.use(requireRole(['super-admin', 'admin']));

// Dashboard & Analytics
router.get('/dashboard', requirePermission('dashboard'), adminController.getDashboardOverview);
router.get('/analytics', requirePermission('analytics'), adminController.getAnalytics);
router.get('/statistics', adminController.getSystemStatistics);

// User Management
router.post('/users', requirePermission('userManagement'), adminController.createUserWithRole);
router.put('/users/:id/roles', requirePermission('userManagement'), adminController.updateUserRoles);

module.exports = router;