const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.get('/list_all_transaction', transactionController.getAllTransaction);

router.post('/get_populate_name_trip/:transactionId', transactionController.getPopulateNameTrip);

router.post('/get_transaction_by_trip_id/:tripId', transactionController.getTransactionByTripId);

router.post('/get_total_money_user/:tripId', transactionController.getTotalMoneyUser);

router.post('/insert_new_transaction',transactionController.createTransaction);

router.put('/update_a_transaction/:transactionId', transactionController.updateTransaction);

router.delete('/delete_a_transaction/:transactionId', transactionController.deleteTransaction);

module.exports = router;
