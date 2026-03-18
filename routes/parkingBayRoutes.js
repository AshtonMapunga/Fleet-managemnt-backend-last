const express = require('express');
const router = express.Router();
const {
  createParkingBay,
  getParkingBays,
  getParkingBayById,
  updateParkingBay,
  updateOccupancy
} = require('../controllers/parkingBayController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Parking Bays
 *   description: Parking bay management endpoints
 */

router.use(protect);

/**
 * @swagger
 * /api/parking-bays:
 *   post:
 *     summary: Create a new parking bay
 *     tags: [Parking Bays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bayNumber
 *               - location
 *               - capacity
 *             properties:
 *               bayNumber:
 *                 type: string
 *                 example: "A101"
 *               location:
 *                 type: string
 *                 example: "Basement Level 1"
 *               vehicleType:
 *                 type: string
 *                 enum: [car, truck, bus, motorcycle, all]
 *                 default: all
 *               capacity:
 *                 type: number
 *                 example: 10
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["EV Charging", "Covered"]
 *               department:
 *                 type: string
 *                 description: Department ID
 *     responses:
 *       201:
 *         description: Parking bay created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/')
  .post(createParkingBay)
  /**
   * @swagger
   * /api/parking-bays:
   *   get:
   *     summary: Get all parking bays
   *     tags: [Parking Bays]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of parking bays
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   */
  .get(getParkingBays);

/**
 * @swagger
 * /api/parking-bays/{id}:
 *   get:
 *     summary: Get parking bay by ID
 *     tags: [Parking Bays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parking bay ID
 *     responses:
 *       200:
 *         description: Parking bay details
 *       404:
 *         description: Parking bay not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     summary: Update parking bay
 *     tags: [Parking Bays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Parking bay updated
 *       404:
 *         description: Parking bay not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.route('/:id')
  .get(getParkingBayById)
  .put(updateParkingBay);

/**
 * @swagger
 * /api/parking-bays/{id}/occupancy:
 *   patch:
 *     summary: Update parking bay occupancy
 *     tags: [Parking Bays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentOccupancy
 *             properties:
 *               currentOccupancy:
 *                 type: number
 *                 example: 5
 *     responses:
 *       200:
 *         description: Occupancy updated
 *       404:
 *         description: Parking bay not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:id/occupancy', updateOccupancy);

module.exports = router;
