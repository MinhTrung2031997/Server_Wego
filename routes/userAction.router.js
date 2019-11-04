const express = require('express');
const router = express.Router();
const userActionController = require('../controllers/userAction.controller');

router.get('/get_list_all_user_action', userActionController.getAllUserAction);

module.exports = router;
