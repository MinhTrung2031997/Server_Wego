const mongoose = require('mongoose');
const Transaction = require("../models/transaction.model");


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
    getPopulateNameTrip: (req,res,next) => {
        Transaction.findOne({_id:mongoose.Types.ObjectId(req.params.transactionId)})
            .populate('trip_id')
            .exec((err, data) => {
                if (err){
                    res.json({
                        result:"failed",
                        data:[],
                        message:"query failed"
                    })
                } else {
                    res.json({
                        result:"ok",
                        data: data,
                        message:"query successfully"
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
    createTransaction: async (req, res, next) => {
        let tripId = await Transaction.findOne({trip_id: mongoose.Types.ObjectId(req.body.trip_id)});
        if (tripId) {
            let arrUser = Transaction.find({trip_id: mongoose.Types.ObjectId(req.body.trip_id)});
            let name = await arrUser.findOne({name: req.body.name});
            if (name) {
                return res.status(400).json({error: "transaction is exits"});
            }
        }

        let transaction = new Transaction(req.body);
        transaction.save()
            .then(item => {
                res.json({
                    result: "ok",
                    data: item,
                    message: "Insert new transaction Successfully"
                })
            })
            .catch(err => {
                res.status(400).send(`error is :${err}`);
            });

    },
    updateTransaction: async (req, res, next) => {
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
        if (req.body.name && req.body.name.length > 2 && req.body.amount && req.body.list_user) {
            newValues = {
                update_date:update_date,
                name: req.body.name,
                amount: req.body.amount,
                list_user:req.body.list_user
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
                })
            }
        })
    },
    deleteTransaction: (req, res, next) => {
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
        })
    }
};
