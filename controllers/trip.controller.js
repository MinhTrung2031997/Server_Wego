const Trip = require("../models/trip.model");
const TripUser = require("../models/tripUser.model");
const Transaction = require("../models/transaction.model");
const TransactionUser = require("../models/transactionUser.model");
const {User} = require("../models/user.model");
const mongoose = require('mongoose');
const mailer = require("../nodemailer/mailer")

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
        Trip.findOne({ _id: mongoose.Types.ObjectId(req.params.tripId) })
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
        try {
            const { name, author, list_user } = req.body;
            const userAuthor = await User.findOne({_id: req.body.author});
            let nameTrip = await Trip.findOne({ name: req.body.name });
            if (nameTrip) {
                return res.status(400).json({ error: "trip already exists" });
            }

            let trip = new Trip({ name, author });
            let saveTrip = await trip.save();
            await res.json({ saveTrip });
            let user_create = await User.findOne({ _id: mongoose.Types.ObjectId(req.body.author) });
            let tripUser = new TripUser({
                user_id: user_create._id,
                trip_id: saveTrip._id
            });

            // random avatar
            function getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            }
            async function senMailInvite(email, nameAuthor, emailAuthor, nameTrip) {
                // Compose email
                const html = `Hi there,
                    <br/>
                    Welcome to Wego!
                    <br/>
                    <p>${nameAuthor} - ${emailAuthor} just added you to the group "${nameTrip}" on Wego.</p>
                    <br/>
                    Visit now: ...
                    <br/>
                    <br/><br/>
                    Have a pleasant day.`

                await mailer.sendEmail('tranvler344@gmail.com', email, 'Welcome to Wego', html);
            }

            await tripUser.save();
            for (let i = 0; i < list_user.length; i++) {
                let user = new User({
                    name: list_user[i].name,
                    email: list_user[i].email,
                    avatar: getRandomInt(6)
                });
                let saveUser = await user.save();
                senMailInvite(list_user[i].email, userAuthor.name, userAuthor.email, req.body.name)
                let tripUser = new TripUser({
                    user_id: saveUser._id,
                    trip_id: saveTrip._id
                });
                tripUser.save();
               
            }
        } catch (error) {
            console.log(error)
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
            return res.status(400).json({ error: "not be empty" });
        }
        const options = {
            new: true,
            multi: true
        };
        Trip.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updateTrip) => {
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
    },
    addMemberToTrip: async (req, res, next) => {
        const { list_user } = req.body;
        let trip = await Trip.findOne({ _id: mongoose.Types.ObjectId(req.params.tripId) });
        await res.json({ trip });
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
            }
        } else {
            return res.status(400).json({ error: "trip not exits" });
        }


    },
    deleteMemberToTrip: async (req, res, next) => {
        const { list_user } = req.body;
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
        }


    },

    deleteTrip: async (req, res, next) => {
        Trip.findOneAndRemove({ _id: mongoose.Types.ObjectId(req.params.tripId) }, (err) => {
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
    }

};
