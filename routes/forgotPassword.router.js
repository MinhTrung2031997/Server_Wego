const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
const { User } = require('../models/user');


router.post('/',  async (req, res) => {
    // First Validate The HTTP Request
    const { error } = validateReset(req.body);
    if (error) {
        return res.status(400).json({error:error.message});
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({error: 'incorrect email'});
    }
    if (!user.pinCode || user.pinCode != req.body.pinCode){
        return res.status(400).json({ error: 'Sorry, PIN code invalid' });
    }

    user.password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.pinCode = null;
    await user.save();
    res.json({result: 'Change password successful'});

});

function validateReset(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email({ minDomainAtoms: 2 }).error(new Error('email invalid')),
        password: Joi.string().min(5).max(255).required().error(new Error('password must be at least 5 characters')),
        pinCode: Joi.string().min(5).max(255).error(new Error('PIN must be at 6 characters'))
    };

    return Joi.validate(req, schema);
}
module.exports = router;
