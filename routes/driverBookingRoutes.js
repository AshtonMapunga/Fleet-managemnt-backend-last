const express = require('express');
const router = express.Router();
const driverBookingController = require('../controllers/driverBookingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip and driver booking management endpoints
 */

// All routes protected
router.use(protect);

/**
 * @swagger
 * /api/driver-booking/create:
 *   post:
 *     summary: Book a driver
 *     tags: [Trips]
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
 *               - destination
 *               - scheduledPickupTime
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: Driver ID
 *               vehicleId:
 *                 type: string
 *                 description: Vehicle ID
 *               passengerName:
 *                 type: string
 *                 description: Passenger name
 *               passengerContact:
 *                 type: string
 *                 description: Passenger contact information
 *               pickupLocation:
 *                 type: string
 *                 description: Pickup location
 *               destination:
 *                 type: string
 *                 description: Destination
 *               scheduledPickupTime:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled pickup time
 *               purpose:
 *                 type: string
 *                 description: Trip purpose
 *               department:
 *                 type: string
 *                 description: Department ID
 *     responses:
 *       201:
 *         description: Driver booked successfully
 *       400:
 *         description: Booking failed
 */
router.post('/create', driverBookingController.bookADriver);

/**
 * @swagger
 * /api/driver-booking/getAllDriverBookings:
 *   get:
 *     summary: Get all driver bookings
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 */
router.get('/getAllDriverBookings', driverBookingController.getAllDriverBookings);

/**
 * @swagger
 * /api/driver-booking/getBookingsByDriver:
 *   get:
 *     summary: Get driver bookings by driver ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: driver
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver bookings retrieved successfully
 */
router.get('/getBookingsByDriver', driverBookingController.getDriverBookingsById);

/**
 * @swagger
 * /api/driver-booking/getDriverRequests:
 *   get:
 *     summary: Get driver requests
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: driver
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver requests retrieved successfully
 */
router.get('/getDriverRequests', driverBookingController.getDriverRequests);

/**
 * @swagger
 * /api/driver-booking/{id}:
 *   get:
 *     summary: Get driver booking by ID
 *     tags: [Trips]
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
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */
router.get('/:id', driverBookingController.getDriverBookingById);

module.exports = router;