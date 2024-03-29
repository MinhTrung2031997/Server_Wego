const express = require('express');
const router = express.Router();
const placeLocationController = require('../controllers/placeLocation.controller');

router.get('/get_placeLocation_by_trip_id/:tripId', placeLocationController.getAllPlaceLocation);

router.post('/directions_between_two_point', placeLocationController.direction);

module.exports = router;
