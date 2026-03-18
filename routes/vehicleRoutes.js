const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management endpoints
 */

// All vehicle routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/vehicle/create:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleDetails
 *             properties:
 *               vehicleDetails:
 *                 type: object
 *                 required:
 *                   - registration
 *                   - make
 *                   - model
 *                   - year
 *                   - vehicleType
 *                   - fuelType
 *                   - department
 *                   - insuranceExpiry
 *                 properties:
 *                   registration:
 *                     type: string
 *                     example: "T123ABC"
 *                   make:
 *                     type: string
 *                     example: "Toyota"
 *                   model:
 *                     type: string
 *                     example: "Hilux"
 *                   year:
 *                     type: integer
 *                     example: 2023
 *                   color:
 *                     type: string
 *                     example: "White"
 *                   vehicleType:
 *                     type: string
 *                     enum: [car, truck, van, bus, motorcycle]
 *                   fuelType:
 *                     type: string
 *                     enum: [petrol, diesel, electric, hybrid, cng]
 *                   department:
 *                     type: string
 *                     description: Department ID
 *                   insuranceExpiry:
 *                     type: string
 *                     format: date
 *                     example: "2025-12-31"
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/create', vehicleController.addNewVehicle);

/**
 * @swagger
 * /api/vehicle/getVehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [client]
 *         description: Filter mode (client shows only available vehicles)
 *     responses:
 *       200:
 *         description: List of vehicles
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
router.get('/getVehicles', vehicleController.getAllVehicles);

/**
 * @swagger
 * /api/vehicle/vehicles-with-location:
 *   get:
 *     summary: Get all vehicles with location and driver info
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicles with location details
 */
router.get('/vehicles-with-location', vehicleController.getAllVehiclesWithLocation);

/**
 * @swagger
 * /api/vehicle/vehicle-with-location/{vehicleReg}:
 *   get:
 *     summary: Get specific vehicle with location by registration
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
 *         description: Vehicle details with location
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
 *         description: Vehicles in the department
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
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get('/', vehicleController.getVehicleByRegistration);

/**
 * @swagger
 * /api/vehicle/cartrack/batch-create-vehicles:
 *   post:
 *     summary: Batch create vehicles from Cartrack
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
 *     responses:
 *       201:
 *         description: Vehicles created successfully
 */
router.post('/cartrack/batch-create-vehicles', vehicleController.batchAddVehiclesFromCartrack);

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
 *           enum: [available, in-use, maintenance, out-of-service]
 *         description: Vehicle status
 *     responses:
 *       200:
 *         description: Vehicles with specified status
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
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;
