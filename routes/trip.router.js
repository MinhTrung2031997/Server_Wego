const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');

router.get('/list_all_trip', tripController.getAllTrip);

router.post('/addMemberToTrip/:tripId', tripController.addMemberToTrip);

router.post('/deleteMemberToTrip/:tripId', tripController.deleteMemberToTrip);

router.post('/insert_new_trip',tripController.createTrip );

router.put('/update_a_trip/:tripId', tripController.updateTrip);

router.delete('/delete_a_trip/:tripId', tripController.deleteTrip);

router.post('/upload_image/:tripId', tripController.saveImageInTrip);

router.get('/get_image_in_trip/:tripId', tripController.getImageInTrip);

router.post('/upload_video', tripController.uploadVideo);

router.get('/get_video', tripController.getVideo);

module.exports = router;
