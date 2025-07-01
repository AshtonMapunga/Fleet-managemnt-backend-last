const express = require('express');
const router = express.Router();
const costController = require('../controllers/costController');

router.post('/create', costController.recordCost);
router.get('/getAllCosts', costController.getAllCosts);
router.get('/getCostsByDepartment', costController.getCostsByDepartment);
router.get('/getCostsByCategory', costController.getCostsByCategory);
router.get('/getCostsByAssociatedVihicle', costController.getCostsByRelatedVehicle);

module.exports = router;