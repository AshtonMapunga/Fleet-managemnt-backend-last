const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');

// Fuel record management
router.post('/record', fuelController.recordFuel);
router.get('/', fuelController.getAllFuelRecords);
router.get('/vehicle/:vehicleId', fuelController.getFuelByVehicle);
router.get('/:id', fuelController.getFuelRecordById);
router.put('/:id', fuelController.updateFuelRecord);
router.delete('/:id', fuelController.deleteFuelRecord);
router.patch('/:id/verify', fuelController.verifyFuelRecord);

// Analytics and reports
router.get('/analytics/efficiency', fuelController.getFuelEfficiency);
router.get('/analytics/consumption', fuelController.getFuelConsumption);
router.get('/analytics/cost', fuelController.getFuelCostAnalysis);
router.get('/analytics/theft-detection', fuelController.detectFuelTheft);
router.get('/reports/summary', fuelController.getFuelSummaryReport);

// Fuel card integration
router.post('/fuel-card/sync', fuelController.syncFuelCardData);
router.get('/fuel-card/transactions', fuelController.getFuelCardTransactions);

module.exports = router;