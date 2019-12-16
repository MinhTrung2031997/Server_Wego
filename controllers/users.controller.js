const bcrypt = require('bcrypt');
let fs = require('fs');
const mailer = require("../nodemailer/mailer");
const rn = require('random-number');
const {User} = require("../models/user.model");
const Trip = require("../models/trip.model");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');

module.exports = {
    checkUserExists: async (req, res) => {
        let user = await User.find({ email: { "$regex": req.body.email, "$options": "i" } });
        res.send({data: user});
    },
    getInfoUser: async (req, res) => {
        try {
            const {token} = req.body;
            // decode token retrieve id user
            let decoded = jwt.verify(token, 'PrivateKey');
            let userId = decoded._id;
            // Fetch the user by id
            let user = await User.findOne({_id: userId});
            res.status(200).send(user);
        } catch (error) {
            return res.status(400).json({error: 'Cannot get info user'});
        }
    },
    createUser: async (req, res) => {
        // First Validate The Request
        // const { error } = validate(req.body);
        // if (error) {
        //     return res.status(400).json({ error: error.details[0].message });
        // }
        var gen = rn.generator({
            min: 10000
            , max: 99999
            , integer: true
        });
        const secretToken = gen();
        // Check if this user already exists
        let nameUser = await User.findOne({name: req.body.name});
        let user = await User.findOne({email: req.body.email});
        if (nameUser) {
            return res.status(400).json({error: 'That user already exists!'});
        } else if (user) {

            if (!user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
                user.secretToken = secretToken;
                user.active = false;
                user.save();
                return;
            } else {
                return res.status(400).json({error: 'That email already exists'});
            }
        } else {

            // Generate secret token

            let gen = rn.generator({
                min: 10000
                , max: 99999
                , integer: true
            });
            const secretToken = gen();

            // random avatar
            function getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            }

            // Insert the new user if they do not exist yet

            //user = new User (lodash.pick(req.body,['name','email','password']));
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                secretToken: secretToken,
                active: false,
                avatar: getRandomInt(6),
            });
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(newUser.password, salt);
            await newUser.save();
            res.send(newUser);
            //res.send(lodash.pick(user, ['_id', 'name', 'email', 'password']));

            // Compose email
            const html = `Hi there,
            <br/>
            Thank you for registering!
            <br/><br/>
            Please verify your email by PIN code:
            <br/>
            PIN: <b>${secretToken}</b>
            <br/>
            <br/><br/>
            Have a pleasant day.`

            // Send email
            await mailer.sendEmail('tranvler344@gmail.com', req.body.email, 'Please verify your email!', html);
        }
    },
    verifyUser: async (req, res) => {
        try {
            const {secretToken} = req.body;
            // Find account with matching secret token
            const user = await User.findOne({'secretToken': secretToken});
            if (!user) {
                res.status(400).json({error: 'Sorry, PIN code invalid'})
                return;
            }

            user.active = true;
            user.secretToken = '';
            await user.save();

            const token = jwt.sign({_id: user._id}, 'PrivateKey');
            res.status(200).json({token});

        } catch (error) {
            res.send(error);
        }
    },
    updateUser: async (req, res, next) => {
        let conditions = {};
        if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
            conditions._id = mongoose.Types.ObjectId(req.params.userId)
        } else {
            res.json({
                result: "failed",
                data: [],
                message: "you must enter user_id to update"
            })
        }

        const  email  = req.body.email;
        let user = await User.findOne({ 'email': email });
        if (user && user._id != req.params.userId) {
            res.json({
                result: "failed",
                data: [],
                message: "Email exists, Please enter another email."
            })
            return;
        }

        let newValues = {};
        if (req.body.name && req.body.name.length > 2) {
            newValues = {
                name: req.body.name,
                email: req.body.email,
                update_date: Date.now(),
            }
        }
        const options = {
            new: true
        };
        User.findOneAndUpdate(conditions, {$set: newValues}, options, (err, updateUser) => {
            if (err) {
                res.json({
                    result: "failed",
                    data: [],
                    message: `Cannot update User with ${req.params.userId}. Error is: ${err}`
                })
            } else {
                res.json({
                    result: "ok",
                    data: updateUser,
                    message: "update a user successfully"
                })
            }
        })
    },
    uploadAvatar: async (req, res, next) => {
        let formidable = require('formidable');
        let form = new formidable.IncomingForm();
        form.uploadDir = "./uploads";
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;
        form.multiples = true;
        form.parse(req, async (err, fields, files) => {
            if (err) {
                await res.json({
                    result: "failed",
                    data: [],
                    message: `cannot up load images. Error is ${err}`
                })
            } else {
                let uri = files.photo.path.split("\\")[1];
                await res.json({
                    result: "ok",
                    data: uri,
                    numberOfImages: 1,
                    message: "Successfully images to upload!"
                });
                await User.findOneAndUpdate(
                    {
                        _id: mongoose.Types.ObjectId(req.params.userId)
                    },
                    {
                        $set: {
                            avatar: uri,
                            uploadAvatar: true,
                            update_date: Date.now()
                        }
                    },
                    {
                        options: {
                            new: true,
                            multi: true
                        }
                    }
                )
            }
        });
    },
    getImage: (req, res, next) => {
        const fileName = req.params.name;
        if (!fileName) {
            return res.send({
                status: false,
                message: 'no filename specified',
            })
        }
        // res.sendFile(__dirname + (`./uploads/${fileName}`));
        // console.log(path.resolve(`./uploads/${fileName}`));
        res.sendfile(path.resolve(`./uploads/${fileName}`));
    },
    sendMoneyAllMail: (req, res, next) => {
        // const tripId = req.params.tripId;
        let tripId = '5dd20e6062dd5c39d41b6009';
        const html = `Click link to see the total trip cost: <a href="http://localhost:3001/api/index/sendMailTotalMoney/${tripId}">Click here</a>`;
        mailer.sendEmail('tranvler4444@gmail.com', 'minhtrung2031997@gmail.com', 'Please click the link below to see the total trip cost', html);
        res.json("ok");
    },
    remindPaymentUser: async (req, res, next) => {
        const {tripId, userIdRemind, userIdReminded, amountUserRemind} = req.body;
        let amount = '600,000';
        let trip = await Trip.findOne({_id: mongoose.Types.ObjectId(tripId)});
        let userRemind = await User.findOne({_id: mongoose.Types.ObjectId(userIdRemind)});
        let userReminded = await User.findOne({_id: mongoose.Types.ObjectId(userIdReminded)});
        let title = `Please pay the amount you owe during the trip ${trip.name}`;
        const html = `The amount you are owed is <strong style="color: red">${amount} VNĐ</strong>
          <p>click link here to see total trip cost: <a href="http://localhost:3001/api/index/sendMailTotalMoney/${trip._id}">Click here</a></p>
            `;
        await mailer.sendEmail(userRemind.email, userReminded.email, title, html);
        await res.json('ok');
    }
};
