const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const config = require('./config');

const transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS
    }
}));

module.exports = {
    sendEmail(from, to, subject, html) {
        return new Promise((resolve, reject) => {
            transport.sendMail({ from, subject, to, html}, (err, info) => {
                if (err) reject(err);
                resolve(info);
            });
        });
    }
};
