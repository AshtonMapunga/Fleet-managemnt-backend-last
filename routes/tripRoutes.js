const express = require('express');
const router = express.Router();
const {
  createTrip,
  getTrips,
  getTripById,
  updateTripStatus
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management endpoints
 */

// All trip routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
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
 *               - driver
 *               - vehicle
 *               - startDate
 *               - endDate
 *               - origin
 *               - destination
 *             properties:
 *               driver:
 *                 type: string
 *                 description: Driver ID
 *                 example: "65a1b2c3d4e5f6a7b8c9d0e1"
 *               vehicle:
 *                 type: string
 *                 description: Vehicle ID
 *                 example: "65a1b2c3d4e5f6a7b8c9d0e2"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-20T08:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-20T17:00:00.000Z"
 *               origin:
 *                 type: string
 *                 example: "Main Depot"
 *               destination:
 *                 type: string
 *                 example: "City Center"
 *               purpose:
 *                 type: string
 *                 example: "Goods delivery"
 *               distance:
 *                 type: number
 *                 example: 45.5
 *               status:
 *                 type: string
 *                 enum: [pending, approved, in-progress, completed, cancelled]
 *                 default: pending
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/')
  .post(createTrip)
  /**
   * @swagger
   * /api/trips:
   *   get:
   *     summary: Get all trips
   *     tags: [Trips]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of trips
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
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  .get(getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get trip by ID
 *     tags: [Trips]
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
 *         description: Trip details
 *       404:
 *         description: Trip not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/:id')
  .get(getTripById);

/**
 * @swagger
 * /api/trips/{id}/status:
 *   put:
 *     summary: Update trip status
 *     tags: [Trips]
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
 *                 enum: [pending, approved, in-progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Trip status updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id/status', updateTripStatus);

module.exports = router;
