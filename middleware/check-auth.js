const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');
module.exports = {
    checkAuth: async (req, res) => {
        // First Validate The HTTP Request
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({error:error.message});
        }

        //  Now find the user by their email address
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({error: 'incorrect email or password'});
        }

        // Then validate the Credentials in MongoDB match
        // those provided in the request
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({error:'incorrect email or password'});
        }
        const token = jwt.sign({ _id: user._id }, 'PrivateKey');
        res.status(200).json({token});
    }
};

function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email({ minDomainAtoms: 2 }).error(new Error('email invalid')),
        password: Joi.string().min(5).max(255).required().error(new Error('password must be at least 5 characters'))
    };

    return Joi.validate(req, schema);
}
