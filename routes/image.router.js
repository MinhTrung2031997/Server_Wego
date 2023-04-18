const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');

router.get('/get_images_by_tripId/:tripId', imageController.getImagebyTripId);

module.exports = router;
