var nodemailer = require('nodemailer');
var utils = require('../utils/utils');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ibetcha.mit@gmail.com',
        pass: 'mitKidsHere'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

var emailNotifier = {}

emailNotifier.sendNotification = function (user, emailTo, res, msg){
    console.log("email user: " + user);
    console.log("email receiver: " + emailTo);
    console.log("res shit: " + res);
    if (user){ // only for sending activation code to user
        // setup e-mail data
        console.log("user is fuck", msg.receiver);
        var mailOptions = {
            from: user.username,//user.venmo.name, // sender address
            to: emailTo, // list of receivers
            subject: msg.subject, // Subject line
            text: msg.text, // plaintext body
            html: "Hi " + msg.receiver /*user.venmo.name*/+ "," + "<br><br>" + msg.body /*user.venmo.id*/ + "<br><br>" + "Best," + "<br><br>" + "ibetcha Team" // html body
        };
        transmitEmail(mailOptions, res);       
    } 
    
};

emailNotifier.sendReminder = function(emailTo, msg){
        var mailOptions = {
            from: "ibetcha",
            to: emailTo, // list of receivers
            subject: msg.subject, // Subject line
            text: msg.text, // plaintext body
            html: "Hi " + msg.receiver /*user.venmo.name*/+ "," + "<br><br>" + msg.body /*user.venmo.id*/ + "<br><br>" + "Best," + "<br><br>" + "ibetcha Team" // html body
        };
        transmitEmailAutomated(mailOptions);

}
// send mail with defined transport object
//
var transmitEmail = function(mail, res) {
    console.log("inside transmit");
    transporter.sendMail(mail, function(error, info){
        if(error){
            console.log(error);
            utils.sendErrResponse( res, 500, error);
        } else {
            console.log('Message sent: ' + info.response);
            utils.sendSuccessResponse(res, "success");
        }
    });
};
//send mail in the automated mode
var transmitEmailAutomated = function(mail) {
    console.log("inside transmit");
    var result = true;
    transporter.sendMail(mail, function(error, info){
        if(error){
            console.log(error);
            result = false;

        } else {
            console.log('Message sent: ' + info.response);
        }
        return result;
    });
};

module.exports = emailNotifier;