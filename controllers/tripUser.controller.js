const mongoose = require('mongoose');
const TripUser = require('../models/tripUser.model');

module.exports = {
    getAllUsersByTripId: (req, res, next) => {
        TripUser.find({trip_id: mongoose.Types.ObjectId(req.params.tripId)})
            .populate('user_id')
            .exec((err, users) => {
                if (err) {
                    res.json({
                        result: "failed",
                        data: [],
                        message: "query failed"
                    })
                } else {
                    res.json({
                        result: "ok",
                        data: users,
                        message: "query successfully"
                    })
                }
            })
    }
};
