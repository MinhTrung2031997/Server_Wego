const Trip = require("../models/trip.model");
const TripUser = require("../models/tripUser.model");
const {User} = require("../models/user.model");
const mongoose = require('mongoose');

module.exports = {
    getAllTrip: (req, res, next) => {
        Trip.find()
            .then(trip => {
                res.json({
                    result: "ok",
                    data: trip,
                    message: "Query list of trip successfully"
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
    getUsersByTripId: (req, res, next) => {
        Trip.findOne({_id: mongoose.Types.ObjectId(req.params.tripId)})
            .populate('list_user._id')
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
    },
    createTrip: async (req, res, next) => {
        const {name, author, list_user} = req.body;
        let nameTrip = await Trip.findOne({name: req.body.name});
        if (nameTrip) {
            return res.status(400).json({error: "trip is exits"});
        }

        let trip = new Trip({name, author});
        let saveTrip = await trip.save();
        await res.json({saveTrip});
        let user_create = await User.findOne({_id:mongoose.Types.ObjectId(req.body.author)});
        let tripUser = new TripUser({
            user_id: user_create._id,
            trip_id: saveTrip._id
        });
        await tripUser.save();
        for (let i = 0; i < list_user.length; i++)  {
            let user = new User({
                name:list_user[i].name,
                email:list_user[i].email
            });
            let saveUser = await user.save();
            let tripUser = new TripUser({
                user_id: saveUser._id,
                trip_id: saveTrip._id
            });
            tripUser.save();
        }


    },
    updateTrip: async (req, res, next) => {
        const {list_user} = req.body;
        let trip = Trip.findOne({_id: mongoose.Types.ObjectId(req.params.tripId)});

        let conditions = {}; // search record with "conditions" update
        if (mongoose.Types.ObjectId.isValid(req.params.tripId))//check food_id ObjectId ?
        {
            conditions._id = mongoose.Types.ObjectId(req.params.tripId);//object want update
        } else {
            res.json({
                result: "failed",
                data: [],
                message: "You must enter trip_id to update"
            })
        }
        let newValues = {};
        let update_date = Date.now();
        if (req.body.name && req.body.name.length >= 2) {
            newValues = {
                name: req.body.name,
                update_date: update_date
            }
        } else {
            return res.status(400).json({error: "not be empty"});
        }
        const options = {
            new: true,
            multi: true
        };
        Trip.findOneAndUpdate(conditions, {$set: newValues}, options, (err, updateTrip) => {
            if (err) {
                res.json({
                    result: "Failed",
                    data: [],
                    message: `Cannot update existing trip.Error ias: ${err}`
                })
            } else {
                res.json({
                    result: "ok",
                    data: updateTrip,
                    message: "Update trip successfully"
                });
            }
        });
        TripUser.findOneAndRemove({trip_id: mongoose.Types.ObjectId(req.params.tripId)});
    },
    deleteTrip: (req, res, next) => {
        Trip.findOneAndRemove({_id: mongoose.Types.ObjectId(req.params.tripId)}, (err) => {
            if (err) {
                res.json({
                    result: "failed",
                    data: [],
                    message: `Cannot delete  trip_id ${req.params.tripId} Error is : ${err}`
                })
            }
            res.json({
                result: "ok",
                message: `Delete trip_id ${req.params.tripId} successfully`
            })
        })
    }
};
