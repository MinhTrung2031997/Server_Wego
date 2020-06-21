const Trip = require("../models/trip.model");
const TripUser = require("../models/tripUser.model");
const Transaction = require("../models/transaction.model");
const TransactionUser = require("../models/transactionUser.model");
const UserActivity = require('../models/userActivity.model');
const {User} = require("../models/user.model");
const mongoose = require('mongoose');
const mailer = require("../nodemailer/mailer");
let fs = require("fs");

module.exports = {
    getAllTrip: async (req, res, next) => {
        let trip = await Trip.find();
        let trips = [];
        if (trip) {
            for (let i = 0; i < trip.length; i++) {
                if (trip[i].isDelete === false) {
                    trips.push(trip[i])
                } else {
                    console.log("deleted");
                }
            }
            await res.json(trips);
        } else {
            await res.json({
                result: "failed",
                data: [],
                message: "query not successfully"
            })
        }
    },

    createTrip: async (req, res, next) => {
        //const {name, author, list_user, begin_date, end_date} = req.body;
        const {name, author, list_user} = req.body;
        const userAuthor = await User.findOne({_id: req.body.author});
        let nameTrip = await Trip.findOne({name: req.body.name});
        if (nameTrip) {
                if (nameTrip.isDelete === false)
                return res.status(400).json({error: "Name trip already exists"});
                else {
                    let trip = new Trip({name, author});
                    await trip.save();
                }
        }

        let trip = new Trip({name, author});
        let saveTrip = await trip.save();
        await res.json({saveTrip});
        if (!list_user) {
            let user_create = await User.findOne({_id: mongoose.Types.ObjectId(req.body.author)});
            let tripUser = new TripUser({
                user_id: user_create._id,
                trip_id: saveTrip._id
            });
            await tripUser.save();
            let userCreateTrip = new UserActivity(
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
            // random avatar
            function getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            }

            async function sendMailInvite(email, nameAuthor, emailAuthor, nameTrip) {
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


            for (let i = 0; i < list_user.length; i++) {
                let UserExist = await User.findOne({ email: list_user[i].email });
                if(UserExist){
                    await sendMailInvite(list_user[i].email, userAuthor.name, userAuthor.email, req.body.name);
                    let tripUser = new TripUser({
                        user_id: UserExist._id,
                        trip_id: saveTrip._id
                    });
                    tripUser.save();
                }else {
                    let user = new User({
                        name: list_user[i].name,
                        email: list_user[i].email,
                        avatar: getRandomInt(6)
                    });
                    let saveUser = await user.save();
                   await sendMailInvite(list_user[i].email, userAuthor.name, userAuthor.email, req.body.name);

                    let tripUser = new TripUser({
                        user_id: saveUser._id,
                        trip_id: saveTrip._id
                    });
                    tripUser.save();
                }
            }
            let userCreateTrip = new UserActivity(
                {
                    user_id: author,
                    trip_id: saveTrip._id,
                    type: "created_trip",
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
            await res.json({
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
        let userUpdateTrip = new UserActivity({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            type: "updated",
            update_date: Date.now()
        });
        await userUpdateTrip.save();
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

        let userAddMembers = new UserActivity({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            list_user_add: list_user_add,
            type: "added",
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

        let userReduceMembers = new UserActivity({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            type: "reduce",
            list_user: list_user_reduce,
            reduced_date: Date.now()
        });
        userReduceMembers.save();
    },

    deleteTrip: async (req, res, next) => {
        let trip = await Trip.findOneAndUpdate(
            {
                _id: mongoose.Types.ObjectId(req.params.tripId)
            },
            {
                $set: {
                    isDelete: true,
                    delete_date: Date.now()
                }
            },
            {
                options: {
                    new: true,
                    multi: true
                }
            }
        );

        let transaction = Transaction.updateMany(
            {
                trip_id: mongoose.Types.ObjectId(req.params.tripId)
            },
            {
                $set: {
                    isDelete: true,
                    delete_date: Date.now()
                }
            },
            {
                options: {
                    new: true,
                    multi: true
                }
            },
        );


        await res.json(trip);

        let trip_id = req.params.tripId;
        let a = await TripUser.deleteMany({trip_id: trip_id});
        // let b = await Transaction.deleteMany({ trip_id: trip_id });
        let c = await TransactionUser.deleteMany({trip_id: trip_id});
        console.log(a);
        console.log(c);
        let userDeleteTrip = new UserActivity({
            user_id: req.body.user_id,
            trip_id: req.params.tripId,
            type: "deleted_trip",
            delete_date: Date.now()
        });
        userDeleteTrip.save();
    },
    uploadVideo: async (req, res, next) => {
        let formidable = require('formidable');
        let form = new formidable.IncomingForm();
        form.uploadDir = "./public/video";
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;
        form.multiples = true;
        form.parse(req, async (err, fields, files) => {
            if (err) throw err;

            let tmpPath = files.video.path ;
            let newPath =   files.video.path +".mp4";
            fs.rename(tmpPath, newPath, (err) => {
                if ( err ) console.log('ERROR: ' + err);
                let newPath = files.video.path.split("\\")[2] + ".mp4";
                res.json({newPath});
            })
        });
    },
};
