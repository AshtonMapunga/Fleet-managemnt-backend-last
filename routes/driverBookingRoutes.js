const express = require('express');
const router = express.Router();
const driverBookingController = require('../controllers/driverBookingController');

router.post('/create', driverBookingController.bookADriver);
router.get('/getAllDriverBookings', driverBookingController.getAllDriverBookings);
router.get('/getBookingsByDriver', driverBookingController.getDriverBookingsById);
router.get('/getDriverRequests', driverBookingController.getDriverRequests);

module.exports = router;