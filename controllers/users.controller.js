const bcrypt = require('bcrypt');
const lodash = require('lodash');
const { User, validate } = require("../models/user");
const mailer = require("../nodemailer/mailer");
var rn = require('random-number');

module.exports = {
    createUser: async (req, res) => {
        // First Validate The Request
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check if this user already exists
        let name = await User.findOne({ name: req.body.name });
        let email = await User.findOne({ email: req.body.email });
        if (name) {
            return res.status(400).json({ error: 'That user  already exists!' });
        } else if (email) {
            return res.status(400).json({ error: 'That email already exists' });
        } else {

            // Generate secret token

            var gen = rn.generator({
                min: 10000
                , max: 99999
                , integer: true
            })
            const secretToken = gen();
            console.log('secretToken', secretToken);

            // Insert the new user if they do not exist yet

            //user = new User (lodash.pick(req.body,['name','email','password']));
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                secretToken: secretToken,
                active: false,
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

            res.status(200).json({ result: "PIN code is correct" });
        } catch (error) {
            res.send(error);
        }
    }
};
