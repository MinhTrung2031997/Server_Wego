const mongoose = require('mongoose');
const TransactionUser = require('../models/transactionUser.model');

module.exports = {
    getAllTransactionUser: (req, res, next) => {
        TransactionUser.find()
            .then(transactionUser => {
                res.json({
                    result: "ok",
                    data: transactionUser,
                    message: "Query list of transaction_user successfully"
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
    createTransactionUser: async (req, res, next) => {
        let transactionUser = new TransactionUser(req.body);
        transactionUser.save()
            .then(item => {
                res.json({
                    result: "ok",
                    data: item,
                    message: "Insert new transaction_user Successfully"
                })
            })
            .catch(err => {
                res.status(400).send(`error is :${err}`);
            });

    },
    getAddedTransaction: (req,res,next) => {
        TransactionUser.findOne({_id:mongoose.Types.ObjectId(req.params.transactionUserId)})
            .populate('user_id')
            .populate({
                path:'transaction_id',
                populate:{ path: 'trip_id'}
            })
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
                        data: [ {a: data.user_id.name}, {b:data.transaction_id.name}, {c: data.transaction_id.trip_id.name}],
                        message:"query successfully"
                    })
                }
            })
    },
    updateTransactionUser:  async (req, res, next) => {
        let conditions = {}; // search record with "conditions" update
        if (mongoose.Types.ObjectId.isValid(req.params.transactionUserId))//check food_id ObjectId ?
        {
            conditions._id = mongoose.Types.ObjectId(req.params.transactionUserId);//object want update
        } else {
            res.json({
                result: "failed",
                data: [],
                message: "You must enter transactionUser_id to update"
            })
        }
        let newValues = {};
        if ( req.body.amount ) {
            newValues = {
                type : req.body.type,
                amount: req.body.amount
            }
        } else {
            return  res.status(400).json({error: "not be empty"});
        }
        const options = {
            new: true,
            multi: true
        };
        TransactionUser.findOneAndUpdate(conditions, {$set: newValues}, options, (err, updateTransactionUser) => {
            if (err) {
                res.json({
                    result: "Failed",
                    data: [],
                    message: `Cannot update existing transaction_user.Error is: ${err}`
                })
            } else {
                res.json({
                    result: "ok",
                    data: updateTransactionUser,
                    message: "Update transaction_user successfully"
                })
            }
        })
    },
    deleteTransactionUser: (req,res,next) => {
        TransactionUser.findOneAndRemove({_id: mongoose.Types.ObjectId(req.params.transactionUserId)}, (err) => {
            if (err){
                res.json({
                    result:"failed",
                    data:[],
                    message:`Cannot delete  transaction_user_id ${req.params.transactionUserId} Error is : ${err}`
                })
            }
            res.json({
                result:"ok",
                message:`Delete  transaction_user_id: ${req.params.transactionUserId} successfully`
            })
        })
    }
};
