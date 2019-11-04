const Trip = require("../models/trip.model");
const TripUser = require("../models/tripUser.model");
const Transaction = require("../models/transaction.model");
const TransactionUser = require("../models/transactionUser.model");
const UserAction = require('../models/userAction.model');
const ActivityTrip = require("../models/activityTrip.model");
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
        let activityTrip = new ActivityTrip({_id: saveTrip._id, name, author});
        await activityTrip.save();
        if (!list_user) {
            let user_create = await User.findOne({_id: mongoose.Types.ObjectId(req.body.author)});
            let tripUser = new TripUser({
                user_id: user_create._id,
                trip_id: saveTrip._id
            });
            await tripUser.save();
            let userCreateTrip = new UserAction(
                {
                    user_id: author,
                    trip_id: saveTrip._id,
                    type: "created",
                    create_date: Date.now()
                });
            let saveUserCreateTrip = userCreateTrip.save();
            console.log(saveUserCreateTrip);
        } else {
            let user_create = await User.findOne({_id: mongoose.Types.ObjectId(req.body.author)});
            let tripUser = new TripUser({
                user_id: user_create._id,
                trip_id: saveTrip._id
            });
            await tripUser.save();
            for (let i = 0; i < list_user.length; i++) {
                let user = new User({
                    name: list_user[i].name,
                    email: list_user[i].email
                });
                let saveUser = await user.save();
                let tripUser = new TripUser({
                    user_id: saveUser._id,
                    trip_id: saveTrip._id
                });
                tripUser.save();
            }
            let userCreateTrip = new UserAction(
                {
                    user_id: author,
                    trip_id: saveTrip._id,
                    type: "created",
                    create_date: Date.now()
                });
            let saveUserCreateTrip = await userCreateTrip.save();
            await console.log(saveUserCreateTrip);
        }
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
        let userUpdateTrip = new UserAction({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            type: "updated",
            update_date: Date.now()
        });
        await userUpdateTrip.save();
        await ActivityTrip.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.tripId)
            },
            {
                $set: {
                    name: req.body.name,
                    update_date: update_date
                }
            },
            {
                options: {
                    new: true,
                    multi: true
                }
            }
        );
    },
    addMemberToTrip: async (req, res, next) => {
        const {list_user} = req.body;
        let list_user_add = [];
        let trip = await Trip.findOne({_id: mongoose.Types.ObjectId(req.params.tripId)});
        await res.json({trip});
        if (trip) {
            for (let i = 0; i < list_user.length; i++) {
                let user = new User({
                    name: list_user[i].name,
                    email: list_user[i].email
                });
                let saveUser = await user.save();
                let tripUser = new TripUser({
                    user_id: saveUser._id,
                    trip_id: trip._id
                });
                tripUser.save();
                let add_user = {
                  user_id: saveUser._id
                };
                list_user_add.push(add_user);
            }
        } else {
            return res.status(400).json({error: "trip not exits"});
        }

        let userAddMembers = new UserAction({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            list_user_add:list_user_add,
            type:"added",
            added_date: Date.now()
        });
        await userAddMembers.save();
    },
    deleteMemberToTrip: async (req, res, next) => {
        const {list_user} = req.body;
        let list_user_reduce = [];
        for (let i = 0; i < list_user.length; i++) {
            console.log(list_user[i]);
            let a = await TripUser.findOneAndRemove(
                {
                    $and: [
                        {
                            user_id: mongoose.Types.ObjectId(list_user[i]._id)
                        },
                        {
                            trip_id: mongoose.Types.ObjectId(req.params.tripId)
                        }
                    ]
                }
            );
            console.log(a);
            let reduce_user = {
                user_id: a.user_id
            };
            list_user_reduce.push(reduce_user);
        }

        let userReduceMembers = new UserAction({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            type:"reduce",
            list_user: list_user_reduce,
            reduced_date: Date.now()
        });
        userReduceMembers.save();
    },

    deleteTrip: async (req, res, next) => {
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
        });

        let trip_id = req.params.tripId;
        let a = await TripUser.deleteMany({trip_id: trip_id});
        let b = await Transaction.deleteMany({trip_id: trip_id});
        let c = await TransactionUser.deleteMany({trip_id: trip_id});
        console.log(a);
        console.log(b);
        console.log(c);
        let delete_date = Date.now();
        let userDeleteTrip = new UserAction({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            type: "deleted",
            delete_date: delete_date
        });
        userDeleteTrip.save();
        let activityTrip = await ActivityTrip.findOne({_id: mongoose.Types.ObjectId(req.params.tripId)});
        activityTrip.delete_date = delete_date;
        activityTrip.save();
    }
};
