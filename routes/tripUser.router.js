const express = require('express');
const router = express.Router();
const tripUserController = require('../controllers/tripUser.controller');

router.get('/list_all_tripUser', tripUserController.getAllTripUser);

router.post('/insert_new_tripUser',tripUserController.createTripUser);

router.put('/update_a_tripUser/:tripUserId',tripUserController.updateTripUser);

router.delete('/delete_a_tripUser/:tripUserId',tripUserController.deleteTripUser);

module.exports = router;
