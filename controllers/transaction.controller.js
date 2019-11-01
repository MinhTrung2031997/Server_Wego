const mongoose = require('mongoose');
const Transaction = require("../models/transaction.model");
const TransactionUser = require("../models/transactionUser.model");


module.exports = {
    getAllTransaction: (req, res, next) => {
        Transaction.find()
            .then(transaction => {
                res.json({
                    result: "ok",
                    data: transaction,
                    message: "Query list of transaction successfully"
                })
            })
            .catch(err => {
                res.json({
                    result: "failed",
                    data: [],
                    message: `error is : ${err}`
                })
            })
    },
    getTransactionByTripId: async (req, res, next) => {
        Transaction.find({trip_id: mongoose.Types.ObjectId(req.params.tripId)})
            .then(transactionByTripId => {
                res.json({
                    result: "ok",
                    data: transactionByTripId,
                    message: "Query list of transaction_by_trip_id successfully"
                })
            })
            .catch(err => {
                res.json({
                    result: "failed",
                    data: [],
                    message: `error is : ${err}`
                })
            })
    },
    createTransaction: async (req, res, next) => {
        const {name, author, amount, trip_id, list_user} = req.body;
        let tripId = await Transaction.findOne({trip_id: mongoose.Types.ObjectId(req.body.trip_id)});
        if (tripId) {
            let arrUser = Transaction.find({trip_id: mongoose.Types.ObjectId(req.body.trip_id)});
            let name = await arrUser.findOne({name: req.body.name});
            if (name) {
                return res.status(400).json({error: "transaction is exits"});
            }
        }
        let transaction = new Transaction({name, author, amount, trip_id});
        transaction.save()
            .then(transaction => {
                res.json({
                    result: "ok",
                    data: transaction,
                    message: "save transaction successfully"
                });

                for (let i = 0; i < list_user.length; i++) {
                    if (list_user[i].type === -1) {
                        let transactionUser = new TransactionUser({
                            user_id: list_user[i].user_id,
                            transaction_id: transaction._id,
                            trip_id: trip_id,
                            amount_user: list_user[i].amount_user,
                            type: list_user[i].type,
                            total: (list_user[i].amount_user * list_user[i].type)
                        });
                        transactionUser.save();
                    } else {
                        console.log("Type 1");
                    }
                }
                for (let i = 0; i < list_user.length; i++) {
                    if (list_user[i].type !== -1) {
                        let transactionUser = new TransactionUser({
                            user_id: list_user[i].user_id,
                            transaction_id: transaction._id,
                            trip_id: trip_id,
                            amount_user: list_user[i].amount_user,
                            type: list_user[i].type,
                            total: ( list_user[i].type - list_user[i].amount_user)
                        });
                        transactionUser.save();
                    } else {
                        console.log(`type -1`);
                    }
                }
            })
            .catch(err => {
                res.json({
                    result: "failed",
                    data: [],
                    message: `error is : ${err}`
                })
            });

    },
    updateTransaction: async (req, res, next) => {
        const {list_user} = req.body;
        let conditions = {}; // search record with "conditions" update
        if (mongoose.Types.ObjectId.isValid(req.params.transactionId))//check food_id ObjectId ?
        {
            conditions._id = mongoose.Types.ObjectId(req.params.transactionId);//object want update
        } else {
            res.json({
                result: "failed",
                data: [],
                message: "You must enter transaction_id to update"
            })
        }
        let update_date = Date.now();
        let newValues = {};
        if (req.body.name && req.body.name.length > 2 && req.body.amount) {
            newValues = {
                update_date: update_date,
                name: req.body.name,
                amount: req.body.amount
            }
        } else {
            return res.status(400).json({error: "not be empty"});
        }
        const options = {
            new: true,
            multi: true
        };
        Transaction.findOneAndUpdate(conditions, {$set: newValues}, options, (err, updateTransaction) => {
            if (err) {
                res.json({
                    result: "Failed",
                    data: [],
                    message: `Cannot update existing transaction.Error is: ${err}`
                })
            } else {
                res.json({
                    result: "ok",
                    data: updateTransaction,
                    message: "Update transaction successfully"
                });
            }
        });

        let transactionsUser = await TransactionUser.find({transaction_id: mongoose.Types.ObjectId(req.params.transactionId)});
        console.log(list_user.length, transactionsUser.length);
        if (list_user.length === transactionsUser.length) {
            for (let i = 0; i < list_user.length; i++) {
                let a = await TransactionUser.findOneAndUpdate(
                    {
                        $and: [
                            {
                                user_id: mongoose.Types.ObjectId(list_user[i].user_id)
                            },
                            {
                                transaction_id: mongoose.Types.ObjectId(req.params.transactionId)
                            }
                        ]
                    },
                    {
                        $set: {
                            update_date:update_date,
                            amount_user: list_user[i].amount_user,
                            type: list_user[i].type
                        }
                    },
                    {
                        $options: {
                            new: true,
                            multi: true
                        }
                    }
                );
            }
            let listsTransaction = await TransactionUser.find({transaction_id: req.params.transactionId});
            let sumMoney = 0;
            let typeCount1 = 0;
            for (let i = 0; i < listsTransaction.length; i++) {
                if (listsTransaction[i].type === -1) {
                    sumMoney += listsTransaction[i].amount_user
                } else {
                    typeCount1++;
                }
            }
            for (let i = 0; i < listsTransaction.length; i++) {
                let userTransaction = await TransactionUser.findOne(
                    {
                        $and: [
                            {
                                user_id: mongoose.Types.ObjectId(listsTransaction[i].user_id)
                            },
                            {
                                transaction_id: mongoose.Types.ObjectId(req.params.transactionId)
                            }
                        ]
                    },
                );
                if(userTransaction.type === -1){
                    userTransaction.total =userTransaction.amount_user * userTransaction.type;
                }
                else {
                    userTransaction.total = sumMoney/typeCount1;
                }
                userTransaction.save();
            }
        } else {
            let transactionsDelete = [];
            let strTransaction = [];
            let list_users = [];
            for (let i in transactionsUser) {
                let str = JSON.stringify(transactionsUser[i].user_id);
                let a = str.replace(/^"|"$/g, '');
                strTransaction.push(a);
            }
            for (let i = 0; i < list_user.length; i++) {
                let a = list_user[i].user_id;
                list_users.push(a);
            }
            strTransaction.forEach(item => {
                if (list_users.some(items => {
                    return item === items
                })) {
                    console.log("equal");
                } else {
                    transactionsDelete.push(item)
                }
            });
            console.log(transactionsDelete);
            for (let i = 0; i < transactionsDelete.length; i++) {
                await TransactionUser.findOneAndRemove(
                    {
                        $and: [
                            {
                                user_id: mongoose.Types.ObjectId(transactionsDelete[i])
                            },
                            {
                                transaction_id: mongoose.Types.ObjectId(req.params.transactionId)
                            }
                        ]
                    }
                );
            }

            for (let i = 0; i < list_user.length; i++) {
                await TransactionUser.findOneAndUpdate(
                    {
                        $and: [
                            {
                                user_id: mongoose.Types.ObjectId(list_user[i].user_id)
                            },
                            {
                                transaction_id: mongoose.Types.ObjectId(req.params.transactionId)
                            }
                        ]
                    },
                    {
                        $set: {
                            update_date:update_date,
                            amount_user: list_user[i].amount_user,
                            type: list_user[i].type
                        }
                    },
                    {
                        $options: {
                            new: true,
                            multi: true
                        }
                    }
                );
            }

            let listsTransaction = await TransactionUser.find({transaction_id: req.params.transactionId});
            let sumMoney = 0;
            let typeCount1 = 0;
            for (let i = 0; i < listsTransaction.length; i++) {
                if (listsTransaction[i].type === -1) {
                    sumMoney += listsTransaction[i].amount_user
                } else {
                    typeCount1++;
                }
            }
            for (let i = 0; i < listsTransaction.length; i++) {
                let userTransaction = await TransactionUser.findOne(
                    {
                        $and: [
                            {
                                user_id: mongoose.Types.ObjectId(listsTransaction[i].user_id)
                            },
                            {
                                transaction_id: mongoose.Types.ObjectId(req.params.transactionId)
                            }
                        ]
                    },
                );
                if(userTransaction.type === -1){
                    userTransaction.total =userTransaction.amount_user * userTransaction.type;
                }
                else {
                    userTransaction.total = sumMoney/typeCount1;
                }
                userTransaction.save();
            }
        }
    },
    deleteTransaction: async (req, res, next) => {
        Transaction.findOneAndRemove({_id: mongoose.Types.ObjectId(req.params.transactionId)}, (err) => {
            if (err) {
                res.json({
                    result: "failed",
                    data: [],
                    message: `Cannot delete  transaction_id ${req.params.transactionId} Error is : ${err}`
                })
            }
            res.json({
                result: "ok",
                message: `Delete transaction_id: ${req.params.transactionId} successfully`
            })
        });
        let Transaction_id = req.params.transactionId;
        let a = await TransactionUser.deleteMany({transaction_id: Transaction_id});
        console.log(a);

    }
};
