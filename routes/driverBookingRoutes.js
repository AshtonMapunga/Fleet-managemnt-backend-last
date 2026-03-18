const express = require('express');
const router = express.Router();
const driverBookingController = require('../controllers/driverBookingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Driver Bookings
 *   description: Driver booking management endpoints
 */

// All booking routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/driver-booking/create:
 *   post:
 *     summary: Create a new driver booking
 *     tags: [Driver Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *               - vehicleId
 *               - passengerName
 *               - passengerContact
 *               - pickupLocation
 *               - scheduledPickupTime
 *               - department
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: Driver ID
 *                 example: "65a1b2c3d4e5f6a7b8c9d0e1"
 *               vehicleId:
 *                 type: string
 *                 description: Vehicle ID
 *                 example: "65a1b2c3d4e5f6a7b8c9d0e2"
 *               passengerName:
 *                 type: string
 *                 example: "John Passenger"
 *               passengerContact:
 *                 type: string
 *                 example: "+255712345681"
 *               pickupLocation:
 *                 type: string
 *                 example: "Main Office"
 *               dropoffLocation:
 *                 type: string
 *                 example: "Airport"
 *               destination:
 *                 type: string
 *                 example: "Airport"
 *               scheduledPickupTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-20T08:00:00.000Z"
 *               department:
 *                 type: string
 *                 description: Department ID
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in-progress, completed, cancelled]
 *                 default: pending
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/create', driverBookingController.createBooking);

/**
 * @swagger
 * /api/driver-booking:
 *   get:
 *     summary: Get all driver bookings
 *     tags: [Driver Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *         description: Filter by driver
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *     responses:
 *       200:
 *         description: List of bookings
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
router.get('/', driverBookingController.getBookings);

/**
 * @swagger
 * /api/driver-booking/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Driver Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:id', driverBookingController.getBookingById);

/**
 * @swagger
 * /api/driver-booking/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Driver Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
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
 *                 enum: [pending, confirmed, in-progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Booking not found
 */
router.put('/:id/status', driverBookingController.updateBookingStatus);

/**
 * @swagger
 * /api/driver-booking/driver/{driverId}:
 *   get:
 *     summary: Get bookings by driver
 *     tags: [Driver Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver's bookings
 */
router.get('/driver/:driverId', driverBookingController.getBookingsByDriver);

/**
 * @swagger
 * /api/driver-booking/vehicle/{vehicleId}:
 *   get:
 *     summary: Get bookings by vehicle
 *     tags: [Driver Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle's bookings
 */
router.get('/vehicle/:vehicleId', driverBookingController.getBookingsByVehicle);

module.exports = router;
