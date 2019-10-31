const express = require('express');
const router = express.Router();
const transactionUserController = require('../controllers/transactionUser.controller');

router.post('/get_total_money_user/:tripId',transactionUserController.getTotalMoneyUser);

module.exports = router;
