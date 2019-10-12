const bcrypt = require('bcrypt');
const lodash = require('lodash');
const {User, validate} = require("../models/user");

module.exports = {
   createUser :  async (req, res) => {
       // First Validate The Request
       const {error} = validate(req.body);
       if (error) {
           return res.status(400).json({error:error.details[0].message});
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

           user = new User (lodash.pick(req.body,['name','email','password']));
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
   }
};
