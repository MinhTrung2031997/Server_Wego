const express = require('express');
const router = express.Router();
const locationUserController = require('../controllers/locationUser.controller');

router.post('/create_or_update_location_user', locationUserController.CreateOrUpdateLocationUser);

module.exports = router;
