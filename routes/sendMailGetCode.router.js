const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
const { User } = require('../models/user');
var rn = require('random-number');
const mailer = require("../nodemailer/mailer");


router.post('/', async (req, res) => {
    // First Validate The HTTP Request
    const { error } = validateReset(req.body);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ error: 'incorrect email' });
    }

    // Generate pin code
    var gen = rn.generator({
        min: 100000
        , max: 999999
        , integer: true
    })
    const pinCode = gen();

    user.pinCode = pinCode;

    await user.save();
    res.json({ result: 'PIN code sent to your email.' });

    // Compose email
    const html = `Hi there,
            <br/>
            Reset Password!
            <br/><br/>
            Please enter PIN code for reset password:
            <br/>
            PIN: <b>${pinCode}</b>
            <br/>
            <br/><br/>
            Have a pleasant day.`

    // Send email
    await mailer.sendEmail('tranvler344@gmail.com', req.body.email, 'Reset Password!', html);
});

function validateReset(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email({ minDomainAtoms: 2 }).error(new Error('email invalid')),
    };

    return Joi.validate(req, schema);
}
module.exports = router;
