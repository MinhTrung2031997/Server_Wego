const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.get('/get_messages_by_trip_id/:tripId', chatController.getAllMessage);

router.post('/save_image_chat', chatController.saveImage);

router.post('/save_audio_recording', chatController.audioRecording);

module.exports = router;
