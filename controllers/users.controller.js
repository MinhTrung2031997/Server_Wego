const bcrypt = require('bcrypt');
const lodash = require('lodash');
const mailer = require("../nodemailer/mailer");
var rn = require('random-number');
const { User, validate } = require("../models/user.model");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

module.exports = {
    checkUserExists: async (req, res) => {
        let user = await User.find({ email: { "$regex": req.body.email, "$options": "i" } });
        res.send({data: user});
    },
    getInfoUser: async (req, res) => {
        try {
            const { token } = req.body;
            // decode token retrieve id user
            let decoded = jwt.verify(token, 'PrivateKey');
            var userId = decoded._id;
            // Fetch the user by id 
            let user = await User.findOne({ _id: userId });
            res.status(200).send(user);
        } catch (error) {
            return res.status(400).json({ error: 'Cannot get info user' });
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
        let nameUser = await User.findOne({ name: req.body.name });
        let user = await User.findOne({ email: req.body.email });
        if (nameUser) {
            return res.status(400).json({ error: 'That user already exists!' });
        } else 
        if (user) {

            if (!user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash (req.body.password, salt);
                user.secretToken = secretToken;
                user.active = false;
                user.save();
                return ;
            }
            else {
                return res.status(400).json({ error: 'That email already exists' });
            }
        }

        else {

            // Generate secret token

            var gen = rn.generator({
                min: 10000
                , max: 99999
                , integer: true
            })
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
            const { secretToken } = req.body;
            // Find account with matching secret token
            const user = await User.findOne({ 'secretToken': secretToken });
            if (!user) {
                res.status(400).json({ error: 'Sorry, PIN code invalid' })
                return;
            }

            user.active = true;
            user.secretToken = '';
            await user.save();

            const token = jwt.sign({ _id: user._id }, 'PrivateKey');
            res.status(200).json({ token });

        } catch (error) {
            res.send(error);
        }
    },
    updateUser: (req, res, next) => {
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

        let newValues = {};
        if (req.body.name && req.body.name.length > 2) {
            newValues = {
                name: req.body.name
            }
        }
        const options = {
            new: true
        };
        User.findOneAndUpdate(conditions, { $set: newValues }, options, (err, updateUser) => {
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
    }
};
