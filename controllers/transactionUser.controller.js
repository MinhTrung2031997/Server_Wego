const mongoose = require('mongoose');
const TransactionUser = require('../models/transactionUser.model');
const Trip = require("../models/trip.model");
const {User} = require("../models/user.model");

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
        }).populate('user_id')
            .exec((err, item) => {
                if (err) {
                    res.json({
                        result: "failed",
                        data: [],
                        message: "query failed"
                    })
                } else {
                    res.json({
                        result: "ok",
                        data: item,
                        message: "query successfully"
                    })
                }
            })
    },
    getTotalMoneyAllUserInOneTrip: async (req, res, next) => {
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
        await res.json({listUser});
    },
    getMoneyByUserIdAllTrip: async (req, res, next) => {
        let tripMoney = await TransactionUser.aggregate([
            {
                $match: { user_id: mongoose.Types.ObjectId(req.params.userId) }
            },
            {
                $group: {
                    _id: "$trip_id",
                    totalBalance: { $sum: "$total" }
                }
            }
        ]);
        let listTrip = [];
        for (let i = 0; i < tripMoney.length; i++) {
            let a = await Trip.findOne({ _id: mongoose.Types.ObjectId(tripMoney[i]._id) });
            a.oweUser = tripMoney[i].totalBalance;
            listTrip.push(a);
        }
        await res.json({ data: listTrip });
    },
    getTotalMoneyUserAllTransactionInOneTrip: async (req, res, next) => {
        TransactionUser.find({
            $and: [
                {
                    trip_id: mongoose.Types.ObjectId(req.body.trip_id)
                },
                {
                    user_id: mongoose.Types.ObjectId(req.body.user_id)
                }
            ]
        }).populate('transaction_id')
            .exec((err, item) => {
                if (err) {
                    res.json({
                        result: "failed",
                        data: [],
                        message: "query failed"
                    })
                } else {
                    res.json({
                        result: "ok",
                        data: item,
                        message: "query successfully"
                    })
                }
            })
    }
};
