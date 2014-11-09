var nodemailer = require('nodemailer');

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

emailNotifier.sendNotification = function (user, emailTo){

    if (user){ // only for sending activation code to user
        // setup e-mail data
        var mailOptions = {
            from: user.venmo.name, // sender address
            to: emailTo, // list of receivers
            subject: 'Activate Your Account', // Subject line
            text: "You have a new message on Tim in a Suit.", // plaintext body
            html: "Hi " + user.username + "," + "<br><br>" + "Please go the following link to login with Venmo:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/login" + user.venmo.id + "<br><br>" + "Best," + "<br><br>" + "ibetcha Team" // html body
        };
    } 
   

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}

module.exports = emailNotifier;