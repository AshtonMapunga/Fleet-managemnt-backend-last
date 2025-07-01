const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.post('/create', maintenanceController.recordMaintenance);
router.get('/', maintenanceController.getAllMaintenance);
router.get('/vehicle', maintenanceController.getMaintenanceByVehicleId);
router.put('/editMaintenance', maintenanceController.editMaintenance);

module.exports = router;