const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

router.post('/create', vehicleController.addNewVehicle);
router.get('/getVehicles', vehicleController.getAllVehicles);
router.get('/vehicles-with-location', vehicleController.getAllVehiclesWithLocation);
router.get('/vehicle-with-location/:vehicleReg', vehicleController.getVehicleWithLocation);
router.get('/getVehiclesByDepartment', vehicleController.getVehiclesByDepartment);
router.get('/', vehicleController.getVehicleByRegistration);
router.put('/update-details/:vehicleReg', vehicleController.updateVehicleDetails);
router.post('/cartrack/batch-create-vehicles', vehicleController.batchAddVehiclesFromCartrack);
router.put('/update-tracking/:vehicleReg', vehicleController.updateVehicleTracking);
router.get('/status/:status', vehicleController.getVehiclesByStatus);

module.exports = router;