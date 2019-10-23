const Trip = require("../models/trip.model");
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

        // .populate('list_user')
        // .exec((err, users) => {
        //     if (err) {
        //         res.json({
        //             result: "failed",
        //             data: [],
        //             message: "query failed"
        //         })
        //     } else {
        //         res.json({
        //             result: "ok",
        //             data: users,
        //             message: "query successfully"
        //         })
        //     }
        // })
    },
    createTrip: async (req, res, next) => {

        let name = await Trip.findOne({name: req.body.name});
        if (name) {
            return res.status(400).json({error: "trip is exits"});
        }

        let trip = new Trip(req.body);
        trip.save()
            .then(item => {
                res.json({
                    result: "ok",
                    data: item,
                    message: "Insert new trip Successfully"
                })
            })
            .catch(err => {
                res.status(400).send(`error is :${err}`);
            });

    },
    updateTrip: async (req, res, next) => {
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
        if (req.body.name && req.body.name.length) {
            // newValues.name = req.body.name;
            // newValues.amount = req.body.amount;
            newValues = {
                name: req.body.name,
                list_user: req.body.list_user,
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
                    message: `Cannot update existing trip.Error is: ${err}`
                })
            } else {
                res.json({
                    result: "ok",
                    data: updateTrip,
                    message: "Update trip successfully"
                })
            }
        })
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
