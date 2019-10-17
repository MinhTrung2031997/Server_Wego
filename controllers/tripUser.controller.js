const mongoose = require('mongoose');
const TripUser = require('../models/tripUser.model');

module.exports = {
    getAllTripUser: (req, res, next) => {
        TripUser.find()
            .then(tripUser => {
                res.json({
                    result: "ok",
                    data: tripUser,
                    message: "Query list if trip successfully"
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
    createTripUser: async (req, res, next) => {
        let tripUser = new TripUser(req.body);
        tripUser.save()
            .then(item => {
                res.json({
                    result: "ok",
                    data: item,
                    message: "Insert new trip_user Successfully"
                })
            })
            .catch(err => {
                res.status(400).send(`error is :${err}`);
            });

    },
    updateTripUser:  async (req, res, next) => {
        let conditions = {}; // search record with "conditions" update
        if (mongoose.Types.ObjectId.isValid(req.params.tripUserId))//check food_id ObjectId ?
        {
            conditions._id = mongoose.Types.ObjectId(req.params.tripUserId);//object want update
        } else {
            res.json({
                result: "failed",
                data: [],
                message: "You must enter trip_user_id to update"
            })
        }
        let newValues = {};
        if ( req.body.amount) {
            // newValues.name = req.body.name;
            // newValues.amount = req.body.amount;
            newValues = {
                amount: req.body.amount
            }
        } else {
            return  res.status(400).json({error: "not be empty"});
        }
        const options = {
            new: true,
            multi: true
        };
        TripUser.findOneAndUpdate(conditions, {$set: newValues}, options, (err, updateTripUser) => {
            if (err) {
                res.json({
                    result: "Failed",
                    data: [],
                    message: `Cannot update existing trip_user.Error is: ${err}`
                })
            } else {
                res.json({
                    result: "ok",
                    data: updateTripUser,
                    message: "Update food successfully"
                })
            }
        })
    },
    deleteTripUser: (req,res,next) => {
        TripUser.findOneAndRemove({_id: mongoose.Types.ObjectId(req.params.tripUserId)}, (err) => {
            if (err){
                res.json({
                    result:"failed",
                    data:[],
                    message:`Cannot delete  trip_user_id ${req.params.tripUserId} Error is : ${err}`
                })
            }
            res.json({
                result:"ok",
                message:`Delete trip_user_id ${req.params.tripUserId} successfully`
            })
        })
    }
};
