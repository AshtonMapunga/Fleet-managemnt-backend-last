const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative endpoints for fleet management
 */

// All routes protected
router.use(protect);

// ==================== DASHBOARD ====================
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard overview with statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
router.get('/dashboard', requirePermission('dashboard'), adminController.getDashboardOverview);

// ==================== USER & DRIVER MANAGEMENT ====================
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or employee number
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users', requirePermission('userManagement'), adminController.getUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/users', requirePermission('userManagement'), adminController.createUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put('/users/:id', requirePermission('userManagement'), adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: "Inactive"
 *     responses:
 *       200:
 *         description: User status updated successfully
 */
router.patch('/users/:id/status', requirePermission('userManagement'), adminController.toggleUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', requirePermission('userManagement'), adminController.deleteUser);

// ==================== VEHICLE MANAGEMENT ====================
/**
 * @swagger
 * /api/admin/vehicles:
 *   get:
 *     summary: Get all vehicles with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by registration, make, or model
 *     responses:
 *       200:
 *         description: Vehicles retrieved successfully
 */
router.get('/vehicles', requirePermission('vehicleManagement'), adminController.getVehicles);

/**
 * @swagger
 * /api/admin/vehicles:
 *   post:
 *     summary: Add a new vehicle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 */
router.post('/vehicles', requirePermission('vehicleManagement'), adminController.createVehicle);

/**
 * @swagger
 * /api/admin/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vehicle'
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 */
router.put('/vehicles/:id', requirePermission('vehicleManagement'), adminController.updateVehicle);

/**
 * @swagger
 * /api/admin/vehicles/{id}/assign:
 *   patch:
 *     summary: Assign or unassign a vehicle to a driver
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assign
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: Driver ID (required when assigning)
 *               assign:
 *                 type: boolean
 *                 description: true to assign, false to unassign
 *                 example: true
 *     responses:
 *       200:
 *         description: Vehicle assignment updated successfully
 */
router.patch('/vehicles/:id/assign', requirePermission('vehicleManagement'), adminController.assignVehicle);

/**
 * @swagger
 * /api/admin/vehicles/{id}/retire:
 *   patch:
 *     summary: Retire a vehicle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle retired successfully
 */
router.patch('/vehicles/:id/retire', requirePermission('vehicleManagement'), adminController.retireVehicle);

/**
 * @swagger
 * /api/admin/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 */
router.delete('/vehicles/:id', requirePermission('vehicleManagement'), adminController.deleteVehicle);

// ==================== TRIP MANAGEMENT ====================
/**
 * @swagger
 * /api/admin/trips:
 *   get:
 *     summary: Get all trips with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *         description: Filter by driver ID
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Trips retrieved successfully
 */
router.get('/trips', requirePermission('tripManagement'), adminController.getTrips);

/**
 * @swagger
 * /api/admin/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       201:
 *         description: Trip created successfully
 */
router.post('/trips', requirePermission('tripManagement'), adminController.createTrip);

/**
 * @swagger
 * /api/admin/trips/{id}/status:
 *   patch:
 *     summary: Update trip status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, in-progress, completed, cancelled, delayed]
 *                 example: "in-progress"
 *     responses:
 *       200:
 *         description: Trip status updated successfully
 */
router.patch('/trips/:id/status', requirePermission('tripManagement'), adminController.updateTripStatus);

/**
 * @swagger
 * /api/admin/trips/{id}/reassign:
 *   patch:
 *     summary: Reassign a trip to different driver/vehicle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: New driver ID
 *               vehicleId:
 *                 type: string
 *                 description: New vehicle ID
 *     responses:
 *       200:
 *         description: Trip reassigned successfully
 */
router.patch('/trips/:id/reassign', requirePermission('tripManagement'), adminController.reassignTrip);

/**
 * @swagger
 * /api/admin/trips/{id}/cancel:
 *   patch:
 *     summary: Cancel a trip
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Trip cancelled successfully
 */
router.patch('/trips/:id/cancel', requirePermission('tripManagement'), adminController.cancelTrip);

/**
 * @swagger
 * /api/admin/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 */
router.delete('/trips/:id', requirePermission('tripManagement'), adminController.deleteTrip);

// ==================== MAINTENANCE MANAGEMENT ====================
/**
 * @swagger
 * /api/admin/maintenance:
 *   get:
 *     summary: Get all maintenance records with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by maintenance type
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *         description: Filter by vehicle ID
 *     responses:
 *       200:
 *         description: Maintenance records retrieved successfully
 */
router.get('/maintenance', requirePermission('maintenanceManagement'), adminController.getMaintenance);

/**
 * @swagger
 * /api/admin/maintenance:
 *   post:
 *     summary: Schedule maintenance
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Maintenance'
 *     responses:
 *       201:
 *         description: Maintenance scheduled successfully
 */
router.post('/maintenance', requirePermission('maintenanceManagement'), adminController.scheduleMaintenance);

/**
 * @swagger
 * /api/admin/maintenance/{id}:
 *   put:
 *     summary: Update maintenance record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Maintenance'
 *     responses:
 *       200:
 *         description: Maintenance record updated successfully
 */
router.put('/maintenance/:id', requirePermission('maintenanceManagement'), adminController.updateMaintenance);

/**
 * @swagger
 * /api/admin/maintenance/{id}/complete:
 *   patch:
 *     summary: Mark maintenance as completed
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actualCost:
 *                 type: number
 *                 description: Actual cost of maintenance
 *               notes:
 *                 type: string
 *                 description: Completion notes
 *               performedBy:
 *                 type: string
 *                 description: User ID who performed the maintenance
 *     responses:
 *       200:
 *         description: Maintenance marked as completed
 */
router.patch('/maintenance/:id/complete', requirePermission('maintenanceManagement'), adminController.completeMaintenance);

/**
 * @swagger
 * /api/admin/maintenance/{id}:
 *   delete:
 *     summary: Delete maintenance record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance record ID
 *     responses:
 *       200:
 *         description: Maintenance record deleted successfully
 */
router.delete('/maintenance/:id', requirePermission('maintenanceManagement'), adminController.deleteMaintenance);

// ==================== FUEL & EXPENSE MANAGEMENT ====================
/**
 * @swagger
 * /api/admin/fuel:
 *   get:
 *     summary: Get all fuel records with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: vehicleId
 *         schema:
 *           type: string
 *         description: Filter by vehicle ID
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *         description: Filter by driver ID
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Fuel records retrieved successfully
 */
router.get('/fuel', requirePermission('fuelManagement'), adminController.getFuelRecords);

/**
 * @swagger
 * /api/admin/fuel:
 *   post:
 *     summary: Add fuel record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fuel'
 *     responses:
 *       201:
 *         description: Fuel record added successfully
 */
router.post('/fuel', requirePermission('fuelManagement'), adminController.addFuelRecord);

/**
 * @swagger
 * /api/admin/fuel/{id}:
 *   put:
 *     summary: Update fuel record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fuel record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Fuel'
 *     responses:
 *       200:
 *         description: Fuel record updated successfully
 */
router.put('/fuel/:id', requirePermission('fuelManagement'), adminController.updateFuelRecord);

/**
 * @swagger
 * /api/admin/fuel/{id}/verify:
 *   patch:
 *     summary: Verify fuel expense
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fuel record ID
 *     responses:
 *       200:
 *         description: Fuel expense verified successfully
 */
router.patch('/fuel/:id/verify', requirePermission('fuelManagement'), adminController.verifyFuelExpense);

/**
 * @swagger
 * /api/admin/fuel/{id}:
 *   delete:
 *     summary: Delete fuel record
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fuel record ID
 *     responses:
 *       200:
 *         description: Fuel record deleted successfully
 */
router.delete('/fuel/:id', requirePermission('fuelManagement'), adminController.deleteFuelRecord);

// ==================== ANALYTICS ====================
/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get('/analytics', requirePermission('analytics'), adminController.getAnalytics);

// ==================== COMPLIANCE & SAFETY ====================
/**
 * @swagger
 * /api/admin/compliance:
 *   get:
 *     summary: Get compliance and safety data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compliance data retrieved successfully
 */
router.get('/compliance', requirePermission('compliance'), adminController.getComplianceSafety);

// ==================== SYSTEM & ACCESS CONTROL ====================
/**
 * @swagger
 * /api/admin/system:
 *   get:
 *     summary: Get system and access control data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System data retrieved successfully
 */
router.get('/system', requirePermission('systemSettings'), adminController.getSystemAccess);

module.exports = router;