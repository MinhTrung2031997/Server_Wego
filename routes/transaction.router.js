const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.get('/list_all_transaction', transactionController.getAllTransaction);

router.post('/insert_new_transaction',transactionController.createTransaction);

router.put('/update_a_transaction/:transactionId', transactionController.updateTransaction);

router.delete('/delete_a_transaction/:transactionId', transactionController.deleteTransaction);

module.exports = router;
