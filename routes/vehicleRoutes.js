const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management endpoints
 */

// All routes protected
router.use(protect);

/**
 * @swagger
 * /api/vehicle/create:
 *   post:
 *     summary: Add new vehicle (Legacy endpoint)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleDetails:
 *                 type: object
 *                 properties:
 *                   registration:
 *                     type: string
 *                   make:
 *                     type: string
 *                   model:
 *                     type: string
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 */
router.post('/create', vehicleController.addNewVehicle);

/**
 * @swagger
 * /api/vehicle/getVehicles:
 *   get:
 *     summary: Get all vehicles (Legacy endpoint)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *         description: Filter mode (client)
 *     responses:
 *       200:
 *         description: Vehicles retrieved successfully
 */
router.get('/getVehicles', vehicleController.getAllVehicles);

/**
 * @swagger
 * /api/vehicle/vehicles-with-location:
 *   get:
 *     summary: Get vehicles with location and driver info
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicles with location retrieved successfully
 */
router.get('/vehicles-with-location', vehicleController.getAllVehiclesWithLocation);

/**
 * @swagger
 * /api/vehicle/vehicle-with-location/{vehicleReg}:
 *   get:
 *     summary: Get vehicle with location by registration
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleReg
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle registration number
 *     responses:
 *       200:
 *         description: Vehicle data retrieved successfully
 *       404:
 *         description: Vehicle not found
 */
router.get('/vehicle-with-location/:vehicleReg', vehicleController.getVehicleWithLocation);

/**
 * @swagger
 * /api/vehicle/getVehiclesByDepartment:
 *   get:
 *     summary: Get vehicles by department
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department vehicles retrieved successfully
 */
router.get('/getVehiclesByDepartment', vehicleController.getVehiclesByDepartment);

/**
 * @swagger
 * /api/vehicle:
 *   get:
 *     summary: Get vehicle by registration
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehicleReg
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle registration number
 *     responses:
 *       200:
 *         description: Vehicle retrieved successfully
 *       404:
 *         description: Vehicle not found
 */
router.get('/', vehicleController.getVehicleByRegistration);

/**
 * @swagger
 * /api/vehicle/update-details/{vehicleReg}:
 *   put:
 *     summary: Update vehicle details
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleReg
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle registration number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 */
router.put('/update-details/:vehicleReg', vehicleController.updateVehicleDetails);

/**
 * @swagger
 * /api/vehicle/cartrack/batch-create-vehicles:
 *   post:
 *     summary: Batch add vehicles from Cartrack
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicles:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Vehicles batch created successfully
 */
router.post('/cartrack/batch-create-vehicles', vehicleController.batchAddVehiclesFromCartrack);

/**
 * @swagger
 * /api/vehicle/update-tracking/{vehicleReg}:
 *   put:
 *     summary: Update vehicle tracking details
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleReg
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle registration number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tracking details updated successfully
 *       404:
 *         description: Vehicle not found
 */
router.put('/update-tracking/:vehicleReg', vehicleController.updateVehicleTracking);

/**
 * @swagger
 * /api/vehicle/status/{status}:
 *   get:
 *     summary: Get vehicles by status
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE, DISPOSED]
 *         description: Vehicle status
 *     responses:
 *       200:
 *         description: Vehicles retrieved by status
 *       400:
 *         description: Invalid status specified
 */
router.get('/status/:status', vehicleController.getVehiclesByStatus);

/**
 * @swagger
 * /api/vehicle/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
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
 *         description: Vehicle retrieved successfully
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;