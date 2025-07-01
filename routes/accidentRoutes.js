const express = require('express');
const router = express.Router();
const accidentController = require('../controllers/accidentController');

router.post('/createAccident', accidentController.recordAccident);
router.get('/allAccidents', accidentController.getAllAccidents);

module.exports = router;