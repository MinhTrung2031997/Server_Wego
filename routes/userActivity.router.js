const express = require('express');
const router = express.Router();
const userActivityController = require('../controllers/userActivity.controller');

router.post('/get_list_all_user_activity/:user_id', userActivityController.getAllUserActivity);

module.exports = router;
