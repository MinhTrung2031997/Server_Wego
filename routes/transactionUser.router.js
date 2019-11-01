const express = require('express');
const router = express.Router();
const transactionUserController = require('../controllers/transactionUser.controller');

router.post('/get_total_money_user/:tripId',transactionUserController.getTotalMoneyUser);

router.post('/get_transaction_user_by_transaction_id', transactionUserController.getTransactionUserByTransactionIdAndTripId);

router.post('/get_total_money_user_by_id/:userId', transactionUserController.getMoneyByUserId);

module.exports = router;
