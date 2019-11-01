const mongoose = require('mongoose');
const TransactionUser = require('../models/transactionUser.model');
const Trip = require("../models/trip.model");

module.exports = {
    getTransactionUserByTransactionIdAndTripId: (req, res, next) => {
        TransactionUser.find({
            $and: [
                {
                    trip_id: mongoose.Types.ObjectId(req.body.trip_id)
                },
                {
                    transaction_id: mongoose.Types.ObjectId(req.body.transaction_id)
                }
            ]
        }).then(transactionUser => {
            res.json({
                result: "ok",
                data: transactionUser,
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
    getTotalMoneyUser: async (req, res, next) => {
        TransactionUser.aggregate([
            {
                $match: {trip_id: mongoose.Types.ObjectId(req.params.tripId)}
            },
            {
                $group: {
                    _id: "$user_id",
                    totalBalance: {$sum: "$total"}
                }
            }
        ])
    },
    getMoneyByUserId: async (req, res, next) => {
        let tripMoney = await TransactionUser.aggregate([
            {
                $match: {user_id: mongoose.Types.ObjectId(req.params.userId)}
            },
            {
                $group: {
                    _id: "$trip_id",
                    totalBalance: {$sum: "$total"}
                }
            }
        ]);
        let listTrip = [];
        for (let i = 0; i < tripMoney.length; i++) {
            console.log(tripMoney[i]);
            let a = await Trip.findOne({_id: mongoose.Types.ObjectId(tripMoney[i]._id)});
            a.oweUser = tripMoney[i].totalBalance;
            listTrip.push(a);
        }
        await res.json({listTrip});

    }
};
