const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {User} = require('../models/user.model');
const TransactionUser = require('../models/transactionUser.model');
const Transaction = require('../models/transaction.model');
const map = require("lodash");
const zip = require("lodash");


/* GET home page. */
router.get('/sendMailTotalMoney/:tripId', async (req, res, next) => {
    let moneyUser = await TransactionUser.aggregate([
        {
            $match: {trip_id: mongoose.Types.ObjectId(req.params.tripId)}
        },
        {
            $group: {
                _id: "$user_id",
                totalBalance: {$sum: "$total"}
            }
        }
    ]);
    let listUser = [];
    for (let i = 0; i < moneyUser.length; i++) {
        let a = await User.findOne({_id: mongoose.Types.ObjectId(moneyUser[i]._id)});
        a.totalBalanceTrip = moneyUser[i].totalBalance;
        listUser.push(a);
    }
    // await res.json(listUser);
    res.render('index', {
        users: listUser,
        tripId: req.params.tripId
    });
});


router.get('/sendMailTotalMoneyDetails/:tripId/:userId', async (req, res, next) => {

    let listTransaction = await Transaction.find(
        {

            $and: [
                {
                    trip_id: mongoose.Types.ObjectId(req.params.tripId)
                },
                {
                    list_user: {$elemMatch: {user_id: req.params.userId}}
                },
                {
                    isDelete: false
                }
            ]
        }
    );

    let listTransactionUser = [];
    for (let i = 0; i < listTransaction.length; i++) {
        let arr = await TransactionUser.find(
            {
                transaction_id: mongoose.Types.ObjectId(listTransaction[i]._id)
            }
        )
            .populate('user_id')
            .populate('transaction_id');
        for (let i = 0; i < arr.length; i++) {
            listTransactionUser.push(arr[i])
        }
    }

    await res.render('layout',{
        transactionUsers: listTransactionUser
    })


});

module.exports = router;
