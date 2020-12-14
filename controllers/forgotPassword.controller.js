const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user.model');
var rn = require('random-number');
const mailer = require('../nodemailer/mailer');

module.exports = {
  forgotPassword: async (req, res) => {
    // First Validate The HTTP Request
    const { error } = validateReset(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: 'incorrect email' });
    }
    if (!user.pinCode || user.pinCode != req.body.pinCode) {
      return res.status(400).json({ error: 'Sorry, PIN code invalid' });
    }

    user.password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.pinCode = null;
    await user.save();
    res.json({ result: 'Change password successful' });
  },
  sendMailGetCode: async (req, res) => {
    // First Validate The HTTP Request
    const { error } = validateMail(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: 'incorrect email' });
    }

    // Generate pin code
    var gen = rn.generator({
      min: 100000,
      max: 999999,
      integer: true,
    });
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
            Have a pleasant day.`;

    // Send email
    await mailer.sendEmail('tranvler344@gmail.com', req.body.email, 'Reset Password!', html);
  },
};

function validateReset(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email({ minDomainAtoms: 2 }).error(new Error('email invalid')),
    password: Joi.string().min(5).max(255).required().error(new Error('password must be at least 5 characters')),
    pinCode: Joi.string().min(5).max(255).error(new Error('PIN must be at 6 characters')),
  };

  return Joi.validate(req, schema);
}
function validateMail(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email({ minDomainAtoms: 2 }).error(new Error('email invalid')),
  };

  return Joi.validate(req, schema);
}
