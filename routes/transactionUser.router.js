const express = require('express');
const router = express.Router();
const transactionUserController = require('../controllers/transactionUser.controller');

router.get('/list_all_transactionUser', transactionUserController.getAllTransactionUser);

router.post('/insert_new_transactionUser',transactionUserController.createTransactionUser);

router.post('/get_added_transaction/:transactionUserId', transactionUserController.getAddedTransaction);

router.put('/update_a_transactionUser/:transactionUserId', transactionUserController.updateTransactionUser);

router.delete('/delete_a_transactionUser/:transactionUserId', transactionUserController.deleteTransactionUser);

module.exports = router;
