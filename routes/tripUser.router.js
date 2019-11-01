const express = require('express');
const router = express.Router();
const tripUserController = require('../controllers/tripUser.controller');
router.post('/list_all_user_by_tripId/:tripId', tripUserController.getAllUsersByTripId);
module.exports = router;
