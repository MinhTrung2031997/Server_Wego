const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.get('/get_messages_by_trip_id/:tripId', chatController.getAllMessage);



module.exports = router;
