const express = require('express');
const router = express.Router();
const transactionUserController = require('../controllers/transactionUser.controller');

router.get('/get_total_money_user/:tripId', transactionUserController.getTotalMoneyAllUserInOneTrip);

router.post(
  '/get_transaction_user_by_transaction_id_and_trip_id',
  transactionUserController.getTransactionUserByTransactionIdAndTripId,
);

router.post(
  '/get_total_money_user_by_trip_id_and_user_id',
  transactionUserController.getTotalMoneyUserAllTransactionInOneTrip,
);

router.post('/get_total_money_user_by_id/:userId', transactionUserController.getMoneyByUserIdAllTrip);

module.exports = router;
