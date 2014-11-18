var express = require('express');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var time = require('time');
var moment = require('moment');
moment().format();
var router = express.Router();

//linking collections and utils 
var utils = require('../utils/utils');
var emailNotifier = require('../utils/email');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');

var changeStatus = {};

//================== cron job details =========

// for those milestones whose effective date is today,
// change status from "Inactive" to "Open"

function makeMilestoneActive(){
	var today = moment();// SHOULD NOT BE IN UTC FORMAT!!!
						//mongoose searches and converts staff to local
	cleanDates(today);
	var tomorrow = moment();
	tomorrow.add(1, 'd');
	cleanDates(tomorrow);
	//console.log('today: '+today.toString());
	//console.log('tmrw: '+tomorrow.toString());
	
	Milestone
		.update({status:"Inactive", date:{$gte:today, $lt: tomorrow}}, {$set:{status: 'Open'}}, {multi:true})
		.exec(function (err, milestones){
			if (err){
				console.log("Error activating the milestone: "+ err);
			}
			else{
			//nothing should happen
			//console.log("INACTIVE: "+milestones);
			}
		});
}

//COMMENT OUT LINE 66 (emailing reminder) ONCE YOU CAN ADD MONITORS

//changes status of the Milestone object from "Open" or "Pending Action"
//to "Pending Action" if its effective date passed

function makeMilestonePendingAndEmail(){
	var today = moment();// SHOULD NOT BE IN UTC FORMAT!!!
						//mongoose searches and converts staff to local
	cleanDates(today);
	var tomorrow = moment();
	tomorrow.add(1, 'd');
	cleanDates(tomorrow);
	//today.add(6,'d'); //for testing, try to see if stuff has changed
	console.log('today: '+today.toString());
	
	Milestone
		.update({$or:[{status:"Open"}, {status:"Pending Action"}] , date:{$lt:today}}, {$set:{status: 'Pending Action'}}, {multi:true})
		.populate('bet')
		.exec(function (err, milestones){
			console.log("REMIND THEM: "+milestones);
			var l = milestones.length;
			for (var i=0; i<l; i++){
				sendEmailReminder(milestones[i].bet.monitors, milestones[i].bet, milestones[i].author);
			}
		});
}

// changes bets statuses according to their start, end and drop dates
// not started -> action required (if today is start date) + sends email

// any status  -> dropped (if today is drop date) + sends email

function changeBetStatus(){
	var today = moment();// SHOULD NOT BE IN UTC FORMAT!!!
						//mongoose searches and converts staff to local
	cleanDates(today);
	var tomorrow = moment();
	tomorrow.add(1, 'd');
	cleanDates(tomorrow);
	//Not started --> Action Required,
	Bet
		.update({status: "Not Started", startDate: {$gte:today, $lt: tomorrow}, $or:[{monitors: {$size: 3}}, {monitors: {$size: 4}}, {monitors: {$size: 5}}]} ,{$set:{status: 'Action Required'}},{ multi: true })
		.populate('author')
		.exec(function(err, bets1){
			if (err){
				console.log("Error while activating bet: "+err);
			}
			else{
				var l = bets1.length;
				for (var i =0; i< l; i++){
					var bet_id = bets1[i]._id;
					var author = bets1[i].author;
					changeStatus.sendEmailAuthor(author, bet_id, 'Open');
				}
				//handle bets with number of monitors < 3:
				// inactive ----> Dropped
				Bet
					.update({status: "Not Started", startDate: {$gte:today, $lt: tomorrow}, $or: [{monitors: {$size: 0}}, {monitors: {$size: 1}}, {monitors: {$size: 2}}]} ,{$set:{status: 'Dropped'}}, { multi: true })
					.populate('author')
					.exec(function(err, bets){
						if (err){
							console.log("Error while activating bet: "+err);
						}
						else{
							var l = bets.length;
							for (var i =0; i< l; i++){
								var bet_id = bets[i]._id;
								var author = bets[i].author;
								changeStatus.sendEmailAuthor(author, bet_id, 'Dropped');
							}
						}
					});
			}
		});

	// Anything --> Dropped (after dropDate)
	Bet
		.update({status: "Action Required", dropDate: {$gt: today}}, {$set:{status: 'Dropped'}})
		.populate('author')
		.exec(function(err, bets3){
			if (err){
				console.log("Error while dropping bet: "+err);
				return;
			}
			var l = bets3.length;
			for (var i=0; i<l; i++){
				var bet_id = bets3[i]._id;

				Milestone
					.update({bet: bet_id, $or:[{status: "Open"}, {status: "Inactive"}, {status: 'Pending Action'}]}, {$set:{status: 'Closed'}}, {multi:true})
					.exec(function (err, milestones){
						if (err){
							console.log("Error closing milestones: "+err);
						}
					});
				var author = bets3[i].author;
				changeStatus.sendEmailAuthor(author, bet_id, 'Dropped');
			}
		});
}
//Testing function:
//sendEmailAuthor({username:"D", email:"mukushev@mit.edu"}, mongoose.Types.ObjectId(), 'Dropped');


//combine three functions above
changeStatus.overnightCheck = function(){
	makeMilestoneActive();
	makeMilestonePendingAndEmail();
	changeBetStatus();
}
//======================== Emailing out =========================

//notifies user about the change in his/her bet
changeStatus.sendEmailAuthor = function(author, bet_id, status){
	var receiver = author.email;
	//if bet got dropped
	if (status==="Dropped"){
		var msg = {
	      body: "This is a notification that your bet was dropped."+ "<br><br>" 
	          + "You can find your dropped bet at http://ibetcha-mit.herokuapp.com/bets/"+bet_id+ ". <br><br>"
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
	          + "You can find your active bet at http://ibetcha-mit.herokuapp.com/bets/"+bet_id + ". <br><br>"
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
	          + "You can still find your completed bet at http://ibetcha-mit.herokuapp.com/bets/"+bet_id + ". <br><br>"
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
	          + "You can find your closed bet at http://ibetcha-mit.herokuapp.com/bets/"+bet_id + ". <br><br>"
	          + "Your account will be charged shortly. :( <br><br>"
	          + "Better luck next time!",
	      subject: "Ibetcha Notification for failed bet",
	      text: "Your bet is up,"+author.username,
	      receiver: receiver
	    };
		
	}
    emailNotifier.sendReminder(receiver, msg);
}


//send emails to the list of  monitors for each milestone if no one checked it off
//monitors - list of JSON objects

function sendEmailReminder(monitors, bet_id, author){
	var emailList = getMonitorEmails(monitors);
	for (var i = 0; i<emailList.length; i++){
		var receiver = emailList[i];
		var msg = {
	      body: "There is a pending checkoff for "+author.username + "<br><br>" 
	          + " follow the link http://ibetcha-mit.herokuapp.com/acceptfriend/",
	      subject: "Ibetcha Reminder for pending checkoff",
	      text: "You need to checkoff "+author.username,
	      receiver: receiver
	    };
	    emailNotifier.sendReminder(receiver, msg);
	}
	}

//======================== Helpers =========================
function getMonitorEmails(monitors){
	var l = monitors.length;
	var emailList = [];
	for (var i = 0; i<l; i++){
		emailList.push(monitors[i].email);
	}
	return emailList;

}
function cleanDates(someDate){
	someDate.millisecond(0);
	someDate.second(0);
	someDate.minute(0);
	someDate.hour(0);
	//var timezone = (new Date()).getTimezoneOffset(); 
	//someDate.zone(timezone);

}



module.exports = changeStatus;
