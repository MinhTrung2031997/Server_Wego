const express = require('express');
const router = express.Router();
const tripUserController = require('../controllers/tripUser.controller');
router.post('/list_all_user_by_tripId/:tripId', tripUserController.getAllUsersByTripId);
router.get('/get_all_location_user_by_trip_id/:tripId', tripUserController.getAllLocationUserByTripId);
router.post('/push_notification_request_location', tripUserController.pushNotificationRequestLocation);

module.exports = router;
