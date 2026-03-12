const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
    driverLogin,
    getDriverProfile,
    getAssignedVehicle,
    getDriverTrips,
    getTripDetails,
    startTrip,
    endTrip,
    updateGPSLocation,
    reportIssue,
    uploadDocument,
    reportFuel,
    getNavigation
} = require('../controllers/driverController');

/**
 * @swagger
 * tags:
 *   name: Driver
 *   description: Driver operations and trip management
 */

/**
 * @swagger
 * /api/driver/login:
 *   post:
 *     summary: Driver login
 *     tags: [Driver]
 *     description: Authenticate a driver using employee number and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeNumber
 *               - password
 *             properties:
 *               employeeNumber:
 *                 type: string
 *                 example: "DRV001"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "driver123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     driver:
 *                       type: object
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', driverLogin);

// All routes below require authentication and driver role
router.use(protect);
router.use(requireRole('driver'));

/**
 * @swagger
 * /api/driver/profile:
 *   get:
 *     summary: Get driver profile
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authorized
 */
router.get('/profile', getDriverProfile);

/**
 * @swagger
 * /api/driver/assigned-vehicle:
 *   get:
 *     summary: Get assigned vehicle for current driver
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned vehicle retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   nullable: true
 */
router.get('/assigned-vehicle', getAssignedVehicle);

/**
 * @swagger
 * /api/driver/trips:
 *   get:
 *     summary: Get all trips for current driver
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, in-progress, completed, cancelled]
 *         description: Filter trips by status
 *     responses:
 *       200:
 *         description: Trips retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/trips', getDriverTrips);

/**
 * @swagger
 * /api/driver/trips/{id}:
 *   get:
 *     summary: Get trip details by ID
 *     tags: [Driver]
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
 *         description: Trip details retrieved successfully
 *       404:
 *         description: Trip not found
 */
router.get('/trips/:id', getTripDetails);

/**
 * @swagger
 * /api/driver/trips/{id}/start:
 *   post:
 *     summary: Start a trip
 *     tags: [Driver]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Trip started successfully
 *       404:
 *         description: Trip not found
 */
router.post('/trips/:id/start', startTrip);

/**
 * @swagger
 * /api/driver/trips/{id}/end:
 *   post:
 *     summary: End a trip
 *     tags: [Driver]
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
 *               fuelUsed:
 *                 type: number
 *                 description: Fuel used in liters
 *               distance:
 *                 type: number
 *                 description: Distance traveled in km
 *               currentLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Trip ended successfully
 */
router.post('/trips/:id/end', endTrip);

/**
 * @swagger
 * /api/driver/trips/{id}/gps:
 *   post:
 *     summary: Update GPS location during trip
 *     tags: [Driver]
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
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *                 example: -6.7924
 *               lng:
 *                 type: number
 *                 example: 39.2083
 *               speed:
 *                 type: number
 *                 example: 65
 *     responses:
 *       200:
 *         description: GPS location updated
 */
router.post('/trips/:id/gps', updateGPSLocation);

/**
 * @swagger
 * /api/driver/trips/{id}/issues:
 *   post:
 *     summary: Report a vehicle issue
 *     tags: [Driver]
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
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [breakdown, mechanical, accident, delay, other]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue reported successfully
 */
router.post('/trips/:id/issues', reportIssue);

/**
 * @swagger
 * /api/driver/trips/{id}/documents:
 *   post:
 *     summary: Upload trip document
 *     tags: [Driver]
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
 *               - type
 *               - url
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [delivery-note, receipt, proof-of-delivery, other]
 *               url:
 *                 type: string
 *                 description: URL of uploaded document
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post('/trips/:id/documents', uploadDocument);

/**
 * @swagger
 * /api/driver/trips/{id}/fuel:
 *   post:
 *     summary: Report fuel usage
 *     tags: [Driver]
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
 *               amount:
 *                 type: number
 *                 description: Fuel amount in liters
 *               cost:
 *                 type: number
 *                 description: Fuel cost
 *               odometer:
 *                 type: number
 *                 description: Current odometer reading
 *     responses:
 *       200:
 *         description: Fuel usage reported
 */
router.post('/trips/:id/fuel', reportFuel);

/**
 * @swagger
 * /api/driver/trips/{id}/navigation:
 *   get:
 *     summary: Get route navigation information
 *     tags: [Driver]
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
 *         description: Navigation information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                     to:
 *                       type: string
 *                     route:
 *                       type: string
 *                     navigationUrl:
 *                       type: string
 */
router.get('/trips/:id/navigation', getNavigation);

module.exports = router;
