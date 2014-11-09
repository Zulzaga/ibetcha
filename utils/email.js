var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'tim.in.a.suit@gmail.com',
        pass: 'TiMSuiT14'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

var emailNotifier = {}

emailNotifier.sendNotification = function (user){

    if (user){ // only for sending activation code to user
        // setup e-mail data
        var mailOptions = {
            from: 'Tim in a Suit', // sender address
            to: user.venmo.email, // list of receivers
            subject: 'Activate Your Account', // Subject line
            text: "You have a new message on Tim in a Suit.", // plaintext body
            html: "Hi " + user.username + "," + "<br><br>" + "Please go the following link to activate your account:" + "<br><br>" + "http://timinsuit-kkatongo.rhcloud.com/users/activate/" + user._id + "<br><br>" + "Best," + "<br><br>" + "Tim in a Suit Team" // html body
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




//emailNotifier({username: "Kapaya", email: 'kkatongo@mit.edu'});
module.exports = emailNotifier