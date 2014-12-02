var nodemailer = require('nodemailer');
var Bet = require('../models/Bet');
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

var emailNotifier = {};

emailNotifier.sendNotification = function (user, emailTo, res, msg){
    if (user){ // only for sending activation code to user
        // setup e-mail data

        var mailOptions = {
            from: user.username,//user.venmo.name, // sender address
            to: emailTo, // list of receivers
            subject: msg.subject, // Subject line
            text: msg.text, // plaintext body
            html: "Hi " + msg.receiver /*user.venmo.name*/+ "," + "<br><br>" + msg.body /*user.venmo.id*/ + "<br><br>" + "Best," + "<br><br>" + "ibetcha Team" // html body
        };    
    } 
    else{
            var mailOptions = {
                from: "ibetcha",
                to: emailTo, // list of receivers
                subject: msg.subject, // Subject line
                text: msg.text, // plaintext body
                html: "Hi " + msg.receiver /*user.venmo.name*/+ "," + "<br><br>" + msg.body /*user.venmo.id*/ + "<br><br>" + "Best," + "<br><br>" + "ibetcha Team" // html body
            };
    }
    transmitEmail(mailOptions, res);   
    
};


// send mail with defined transport object
var transmitEmail = function(mail, res) {
    if (!res){//in automated mode
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
        return;
    }
    else{ //send response
        transporter.sendMail(mail, function(error, info){
            if(error){
                console.log(error);
                utils.sendErrResponse( res, 500, error);
            } else {
                console.log('Message sent: ' + info.response);
                utils.sendSuccessResponse(res, "success");
            }
        });
        return;
    }
};


//notifies user about the change in his/her bet
emailNotifier.sendEmailAuthor = function(author, bet_id, status){
    var receiver = author.email;
    //if bet got dropped
    if (status==="Dropped"){
        var msg = {
          body: "This is a notification that your bet was dropped."+ "<br><br>" 
              + "You can find your dropped bet at http://mit-ibetcha.herokuapp.com/bets/"+bet_id+ ". <br><br>"
              + "You will not be charged for this bet.",
          subject: "Ibetcha notification for dropping Bet",
          text: "Your bet was dropped,"+author.username,
          receiver: receiver
        };
    }
    //if bet got activated
    else if (status ==='Open'){
        var msg = {
          body: "This is a notification that your bet is now up and running."+ "<br><br>" 
              + "You can find your active bet at http://mit-ibetcha.herokuapp.com/bets/"+bet_id + ". <br><br>"
              + "Good luck with your resolution!",
          subject: "Ibetcha Notification for starting bet",
          text: "Your bet is up,"+author.username,
          receiver: receiver
        };

    }
    //if bet succeeded
    else if(status === 'Succeeded'){
        var msg = {
          body: "This is a notification that your bet is now completed."+ "<br><br>" 
              + "Congratulations on following thorugh with your resolution!"
              + "You can still find your completed bet at http://mit-ibetcha.herokuapp.com/bets/"+bet_id + ". <br><br>"
              + "Good Job!",
          subject: "Ibetcha Notification for bet success",
          text: "Your bet is successful,"+author.username,
          receiver: receiver
        };

    }
    //if bet failed
    else if(status === 'Failed'){
        var msg = {
          body: "This is a notification that you have failed at your bet."+ "<br><br>" 
              + "You can find your closed bet at http://mit-ibetcha.herokuapp.com/bets/"+bet_id + ". <br><br>"
              + "Your account will be charged shortly. :( <br><br>"
              + "Better luck next time!",
          subject: "Ibetcha Notification for failed bet",
          text: "Your bet is up,"+author.username,
          receiver: receiver
        };
        
    }
    emailNotifier.sendNotification(null, receiver,null, msg);
};



//send emails to the list of  monitors for each milestone if no one checked it off
//monitors - list of JSON objects
emailNotifier.sendEmailReminder = function(monitors, bet_id, author){
    Bet
        .findOne({_id:bet_id})
        .populate('monitors')
        .exec(function(err, bet){
            if (err){
                console.log("ERROR IN FINDING BET IN REMINDING FUNCTION");
                return;
            }
            var emailList = getMonitorEmails(bet.monitors);
            for (var i = 0; i<emailList.length; i++){
                var receiver = emailList[i];
                var msg = {
                  body: "There is a pending checkoff for "+author.username + "<br><br>" 
                      + " follow the link http://mit-ibetcha.herokuapp.com/",
                  subject: "Ibetcha Reminder for pending checkoff",
                  text: "You need to checkoff "+author.username,
                  receiver: receiver
                };
                emailNotifier.sendNotification(null,receiver, null, msg);
            }

        });


    };

//======================== Helpers =========================
function getMonitorEmails(monitors){
    var l = monitors.length;
    var emailList = [];
    for (var i = 0; i<l; i++){
        emailList.push(monitors[i].email);
    }
    return emailList;

};

module.exports = emailNotifier;