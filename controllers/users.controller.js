const bcrypt = require('bcrypt');
const lodash = require('lodash');
const {User, validate} = require("../models/user.model");
const mongoose = require('mongoose');

module.exports = {
    createUser: async (req, res) => {
        // First Validate The Request
        const {error} = validate(req.body);
        if (error) {
            return res.status(400).json({error: error.details[0].message});
        }

        // Check if this user already exists
        let name = await User.findOne({name: req.body.name});
        let email = await User.findOne({email: req.body.email});
        if (name) {
            return res.status(400).json({error: 'That user  already exists!'});
        } else if (email) {
            return res.status(400).json({error: 'That email already exists'});
        } else {
            // Insert the new user if they do not exist yet

            let user = new User(lodash.pick(req.body, ['name', 'email', 'password']));
            // user = new User({
            //     name: req.body.name,
            //     email: req.body.email,
            //     password: req.body.password
            // });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await user.save();
            res.send(user);
            //res.send(lodash.pick(user, ['_id', 'name', 'email', 'password']));
        }
    },
    updateUser: (req, res, next) => {
        let conditions = {};
        if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
           conditions._id = mongoose.Types.ObjectId(req.params.userId)
        } else {
            res.json({
                result:"failed",
                data:[],
                message:"you must enter user_id to update"
            })
        }

        let newValues = {};
        if(req.body.name && req.body.name.length > 2){
            newValues = {
                name: req.body.name
            }
        }
        const options = {
            new:true
        };
        User.findOneAndUpdate(conditions,{$set :newValues}, options, (err,updateUser) => {
            if (err) {
                res.json({
                    result:"failed",
                    data:[],
                    message:`Cannot update User with ${req.params.userId}. Error is: ${err}`
                })
            } else {
                res.json({
                    result:"ok",
                    data:updateUser,
                    message:"update a user successfully"
                })
            }
        })
    }
};
