const express = require('express');
const router = express.Router();
const subsidiaryController = require('../controllers/subsidiaryController');

router.post('/create-subsidiary', subsidiaryController.createSubsidiary);

module.exports = router;