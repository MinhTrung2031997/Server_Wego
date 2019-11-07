const express = require('express');
const router = express.Router();
const userActivityController = require('../controllers/userActivity.controller');

router.get('/get_list_all_user_activity', userActivityController.getAllUserActivity);

module.exports = router;
