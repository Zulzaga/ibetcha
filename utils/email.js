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
        console.log("user is fuck");
        var mailOptions = {
            from: user.username,//user.venmo.name, // sender address
            to: emailTo, // list of receivers
            subject: 'Ibetcha Invite from Your Friend!', // Subject line
            text: "You have been invited by your friend to join ibetcha.", // plaintext body
            html: "Hi " + user.username /*user.venmo.name*/+ "," + "<br><br>" + msg + user.username/*user.venmo.id*/ + "<br><br>" + "Best," + "<br><br>" + "ibetcha Team" // html body
        };
        transmitEmail(mailOptions, res);       
    } 
    
};

// send mail with defined transport object
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
}

module.exports = emailNotifier;