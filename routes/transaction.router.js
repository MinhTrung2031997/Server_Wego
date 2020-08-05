const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.get('/get_image', transactionController.getImage);

router.get('/list_all_transaction', transactionController.getAllTransaction);

router.post('/get_transaction_by_trip_id/:tripId', transactionController.getTransactionByTripId);

router.post('/insert_new_transaction', transactionController.createTransaction);

router.put('/update_a_transaction', transactionController.updateTransaction);

router.delete('/delete_a_transaction', transactionController.deleteTransaction);

module.exports = router;
