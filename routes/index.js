const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {User} = require('../models/user.model');
const TransactionUser = require('../models/transactionUser.model');


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
        tripId:req.params.tripId
    });
});

module.exports = router;
