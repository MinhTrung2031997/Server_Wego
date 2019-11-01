const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');

router.get('/list_all_trip', tripController.getAllTrip);

router.post('/list_users_by_trip_id/:tripId', tripController.getUsersByTripId);

router.post('/addMemberToTrip/:tripId', tripController.addMemberToTrip);

router.post('/deleteMemberToTrip/:tripId', tripController.deleteMemberToTrip);

router.post('/insert_new_trip',tripController.createTrip );

router.put('/update_a_trip/:tripId', tripController.updateTrip);

router.delete('/delete_a_trip/:tripId', tripController.deleteTrip);

module.exports = router;
