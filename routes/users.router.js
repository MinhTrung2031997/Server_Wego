const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');

router.post('/get_info_user', userController.getInfoUser);
router.post('/insert_a_user',userController.createUser);
router.put('/update_a_user/:userId', userController.updateUser);

module.exports = router;
