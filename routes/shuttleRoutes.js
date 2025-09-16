const express = require('express');
const router = express.Router();
const shuttleController = require('../controllers/shuttleController');

// Define shuttle-specific routes here
router.post('/create', shuttleController.createShuttle);
router.get('/', shuttleController.getAllShuttles);
router.get('/:id', shuttleController.getShuttleById);
router.put('/update/:id', shuttleController.updateShuttle);
router.delete('/delete/:id', shuttleController.deleteShuttle);
router.get('/status/:status', shuttleController.getShuttlesByStatus);
router.get('/department/:departmentId', shuttleController.getShuttlesByDepartment);

module.exports = router;