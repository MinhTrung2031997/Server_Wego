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
    getPopulateNameTrip: (req, res, next) => {
        Transaction.findOne({_id: mongoose.Types.ObjectId(req.params.transactionId)})
            .populate('trip_id')
            .exec((err, data) => {
                if (err) {
                    res.json({
                        result: "failed",
                        data: [],
                        message: "query failed"
                    })
                } else {
                    res.json({
                        result: "ok",
                        data: data,
                        message: "query successfully"
                    })
                }
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
    getTotalMoneyUser: async (req, res, next) => {
        let a = await TransactionUser.aggregate([
            {
                $match:{trip_id:mongoose.Types.ObjectId(req.params.tripId)}
            },
            {
                $group:{
                    _id:"$user_id",
                    totalBalance:{$sum: "$total"}
                }
            }
        ]);
        await res.json({a});
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
                let money = 0;
                let countType1 = 0;
                for (let i = 0; i < list_user.length; i++) {
                    if (list_user[i].type === -1) {
                        money += list_user[i].amount_user;
                        let transactionUser = new TransactionUser({
                            user_id: list_user[i].user_id,
                            transaction_id: transaction._id,
                            trip_id:trip_id,
                            amount_user: list_user[i].amount_user,
                            type: list_user[i].type,
                            total: (list_user[i].amount_user * list_user[i].type)
                        });
                        transactionUser.save();
                    } else {
                        countType1++;
                    }
                }
                console.log(money, countType1);
                for (let i = 0; i < list_user.length; i++) {
                    if (list_user[i].type === 1) {
                        let transactionUser = new TransactionUser({
                            user_id: list_user[i].user_id,
                            transaction_id: transaction._id,
                            trip_id:trip_id,
                            amount_user: list_user[i].amount_user,
                            type: list_user[i].type,
                            total: (money/countType1)
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

        for (let i = 0; i < list_user.length; i++) {
            let userTransaction = await TransactionUser.findOne({_id: mongoose.Types.ObjectId(list_user[i]._id)});
            userTransaction.amount_user = list_user[i].amount_user;
            userTransaction.save();
        }
    }
    ,
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
