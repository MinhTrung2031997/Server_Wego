const mongoose = require('mongoose');
const TransactionUser = require('../models/transactionUser.model');
const Trip = require("../models/trip.model");
const { User } = require("../models/user.model");
const TripUser = require('../models/tripUser.model');


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
                $match: { trip_id: mongoose.Types.ObjectId(req.params.tripId) }
            },
            {
                $group: {
                    _id: "$user_id",
                    totalBalance: { $sum: "$total" }
                }
            }
        ]);
        let listUser = [];
        for (let i = 0; i < moneyUser.length; i++) {
            let a = await User.findOne({ _id: mongoose.Types.ObjectId(moneyUser[i]._id) });
            a.totalBalanceTrip = moneyUser[i].totalBalance;
            listUser.push(a);
        }
        await res.json({ listUser });
    },
    getMoneyByUserIdAllTrip: async (req, res, next) => {
        // find all trip have user by id
        let allTripHaveUser = await TripUser.aggregate([
            {
                $match: { user_id: mongoose.Types.ObjectId(req.params.userId) }
            },
            {
                $group: {
                    _id: "$trip_id",
                }
            }
        ]);

        // find trip from transactionUser by id user
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
        // assign money of trip
        for (let i = 0; i < tripMoney.length; i++) {
            let a = await Trip.findOne({ _id: mongoose.Types.ObjectId(tripMoney[i]._id) });
            a.oweUser = tripMoney[i].totalBalance;
            listTrip.push(a);
        }
        function findTripNoMoney(x) {
            for (let i = 0; i < tripMoney.length; i++) {
                if (tripMoney[i]._id.toString() === x.toString()) {
                    return true;
                }
            }
            return false;
        }
        var tripNoMoney = [];
        // find trip haven't transaction
        for (let i = 0; i < allTripHaveUser.length; i++) {
            if (!findTripNoMoney(allTripHaveUser[i]._id)) {
                tripNoMoney.push(allTripHaveUser[i]._id)
            }
        }
        // assign 0 for trip haven't transaction
        for (let i = 0; i < tripNoMoney.length; i++) {
            let a = await Trip.findOne({ _id: mongoose.Types.ObjectId(tripNoMoney[i]._id) });
            a.oweUser = 0;
            listTrip.push(a);
        }

        // sort list trip
        const sortListTrip = listTrip.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(a.create_date) - new Date(b.create_date);
        });

        await res.json({ data: sortListTrip });
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
