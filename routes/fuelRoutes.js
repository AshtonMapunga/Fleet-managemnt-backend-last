const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController'); // FIXED: Import fuelController
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Fuel
 *   description: Fuel management endpoints
 */

// All routes protected
router.use(protect);

/**
 * @swagger
 * /api/fuel/record:
 *   post:
 *     summary: Record fuel transaction
 *     tags: [Fuel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - fuelingDate
 *               - odometerReading
 *               - fuelAmount
 *               - fuelType
 *               - costPerUnit
 *               - fuelingLocation
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 description: Vehicle ID
 *               driverId:
 *                 type: string
 *                 description: Driver ID
 *               fuelingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fueling date
 *               odometerReading:
 *                 type: number
 *                 description: Odometer reading
 *               fuelAmount:
 *                 type: number
 *                 description: Fuel amount in liters
 *               fuelType:
 *                 type: string
 *                 enum: [petrol, diesel, electric, hybrid, cng]
 *                 description: Fuel type
 *               costPerUnit:
 *                 type: number
 *                 description: Cost per unit
 *               fuelingLocation:
 *                 type: string
 *                 description: Fueling location
 *               fuelCardNumber:
 *                 type: string
 *                 description: Fuel card number
 *               receiptNumber:
 *                 type: string
 *                 description: Receipt number
 *     responses:
 *       201:
 *         description: Fuel recorded successfully
 */
router.post('/record', fuelController.recordFuel);

/**
 * @swagger
 * /api/fuel:
 *   get:
 *     summary: Get all fuel records
 *     tags: [Fuel]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Fuel records retrieved successfully
 */
router.get('/', fuelController.getAllFuelRecords);

/**
 * @swagger
 * /api/fuel/vehicle/{vehicleId}:
 *   get:
 *     summary: Get fuel records by vehicle
 *     tags: [Fuel]
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
 *         description: Vehicle fuel records retrieved successfully
 */
router.get('/vehicle/:vehicleId', fuelController.getFuelByVehicle);

/**
 * @swagger
 * /api/fuel/{id}:
 *   get:
 *     summary: Get single fuel record
 *     tags: [Fuel]
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
 *         description: Fuel record retrieved successfully
 *       404:
 *         description: Fuel record not found
 */
router.get('/:id', fuelController.getFuelRecordById);

/**
 * @swagger
 * /api/fuel/{id}:
 *   put:
 *     summary: Update fuel record
 *     tags: [Fuel]
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
 *             type: object
 *             properties:
 *               fuelingDate:
 *                 type: string
 *                 format: date-time
 *               odometerReading:
 *                 type: number
 *               fuelAmount:
 *                 type: number
 *               costPerUnit:
 *                 type: number
 *               fuelingLocation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fuel record updated successfully
 *       404:
 *         description: Fuel record not found
 */
router.put('/:id', fuelController.updateFuelRecord);

/**
 * @swagger
 * /api/fuel/{id}:
 *   delete:
 *     summary: Delete fuel record
 *     tags: [Fuel]
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
 *       404:
 *         description: Fuel record not found
 */
router.delete('/:id', fuelController.deleteFuelRecord);

/**
 * @swagger
 * /api/fuel/{id}/verify:
 *   patch:
 *     summary: Verify fuel record
 *     tags: [Fuel]
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
 *             type: object
 *             required:
 *               - verifiedBy
 *             properties:
 *               verifiedBy:
 *                 type: string
 *                 description: User ID who verified
 *     responses:
 *       200:
 *         description: Fuel record verified successfully
 *       404:
 *         description: Fuel record not found
 */
router.patch('/:id/verify', fuelController.verifyFuelRecord);

module.exports = router;