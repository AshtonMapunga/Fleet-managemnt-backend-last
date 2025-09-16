const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// Define parking routes here
router.post('/record', parkingController.recordParking);
router.get('/', parkingController.getAllParkingRecords);
router.get('/vehicle/:vehicleId', parkingController.getParkingByVehicle);
router.get('/shuttle/:shuttleId', parkingController.getParkingByShuttle);
router.get('/:id', parkingController.getParkingRecordById);
router.put('/update/:id', parkingController.updateParkingRecord);
router.delete('/delete/:id', parkingController.deleteParkingRecord);
router.get('/duration/analysis', parkingController.getParkingDurationAnalysis);

module.exports = router;