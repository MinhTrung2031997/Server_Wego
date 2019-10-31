const mongoose = require('mongoose');
const TransactionUser = require('../models/transactionUser.model');

module.exports = {
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
    }
};
