const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Vehicle maintenance management endpoints
 */

// All routes protected
router.use(protect);

/**
 * @swagger
 * /api/maintenance/create:
 *   post:
 *     summary: Record maintenance
 *     tags: [Maintenance]
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
 *               - maintenanceType
 *               - maintenanceDate
 *               - maintenanceCost
 *               - description
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 description: Vehicle ID
 *               maintenanceType:
 *                 type: string
 *                 description: Type of maintenance
 *               maintenanceDate:
 *                 type: string
 *                 format: date
 *                 description: Maintenance date
 *               maintenanceCost:
 *                 type: number
 *                 description: Maintenance cost
 *               description:
 *                 type: string
 *                 description: Maintenance description
 *     responses:
 *       201:
 *         description: Maintenance recorded successfully
 */
router.post('/create', maintenanceController.recordMaintenance);

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get all maintenance records
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Maintenance records retrieved successfully
 */
router.get('/', maintenanceController.getAllMaintenance);

/**
 * @swagger
 * /api/maintenance/vehicle:
 *   get:
 *     summary: Get maintenance by vehicle ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle maintenance records retrieved successfully
 */
router.get('/vehicle', maintenanceController.getMaintenanceByVehicleId);

/**
 * @swagger
 * /api/maintenance/editMaintenance:
 *   put:
 *     summary: Edit maintenance record
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: maintenanceId
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
 *               maintenanceType:
 *                 type: string
 *               maintenanceDate:
 *                 type: string
 *                 format: date
 *               maintenanceCost:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Maintenance record updated successfully
 *       404:
 *         description: Maintenance record not found
 */
router.put('/editMaintenance', maintenanceController.editMaintenance);

module.exports = router;