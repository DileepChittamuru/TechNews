var nodemailer = require('nodemailer');
var logger = require('logger');

//Settings
var settings = require('./../../config/settings');

exports.sendingMail = function(to_mail, subject, body, callback) {
    logger.log("debug", "[sendingMail()]-Calling sendingMail");
    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: settings.mail.service,
        auth: {
            user: settings.mail.userName,
            pass: settings.mail.password
        }
    });
    var mail = {
        from: settings.mail.userName,
        to: to_mail,
        subject: subject,
        html: body
    };
    smtpTransport.sendMail(mail, function(error, response) {
        if (error) {
            logger.log("debug", "[sendingMail()]-error while sending message");
            callback(false);
        } else {
            logger.log("debug", "[sendingMail()]-message send successfuly");
            callback(true);
        }
    });
    smtpTransport.close();
};
