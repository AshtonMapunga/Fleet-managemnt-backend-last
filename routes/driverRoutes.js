const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect, requireRole } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Drivers
 *   description: Driver management endpoints
 */

// All driver routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/driver/profile:
 *   get:
 *     summary: Get driver profile
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile retrieved
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
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Driver role required
 */
router.get('/profile', driverController.getDriverProfile);

/**
 * @swagger
 * /api/driver/trips:
 *   get:
 *     summary: Get driver's trips
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of driver's trips
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Driver role required
 */
router.get('/trips', driverController.getDriverTrips);

/**
 * @swagger
 * /api/driver/available:
 *   get:
 *     summary: Get available drivers
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available drivers
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
 */
router.get('/available', driverController.getAvailableDrivers);

/**
 * @swagger
 * /api/driver/location:
 *   put:
 *     summary: Update driver's current location
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: -6.7924
 *               longitude:
 *                 type: number
 *                 example: 39.2083
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Driver role required
 */
router.put('/location', driverController.updateDriverLocation);

module.exports = router;
