var express = require('express');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var time = require('time');
var moment = require('moment');
moment().format();
var router = express.Router();

//linking collections and utils 
var utils = require('../../utils/utils')
var emailNotifier = require('../../utils/email');

var User = require('../../models/User');
var Bet = require('../../models/Bet');
var Milestone = require('../../models/Milestone');

// TODO:
// -
// Dummy money charging mechanishm (in PUT method when failed) 
// using rating

//================== CRON JOB ==================
var timezone = (new time.Date()).getTimezone();
var job = new CronJob({
  cronTime: '00 01 00 * * *',
  onTick: function() {
  	//sendEmailReminder([{email:'mukushev@mit.edu'}], 'dummy',{username: "test"});
  	//overnightCheck();	
  },
  start: false,
  timeZone: timezone
});
//job.start();

//================== cron job details =========

// DESCRIPTION:
//			changes status of the Milestone object from "Inactive"
//			to "Open" if its effective day is today
// INPUT: none
// OUTPUT: none
function makeMilestoneActive(){
	var today = moment();// SHOULD NOT BE IN UTC FORMAT!!!
						//mongoose searches and converts staff to local
	cleanDates(today);
	var tomorrow = moment();
	tomorrow.add(1, 'd');
	cleanDates(tomorrow);
	console.log('today: '+today.toString());
	console.log('tmrw: '+tomorrow.toString());
	
	Milestone
		.update({status:"Inactive", date:{$gte:today, $lt: tomorrow}}, {$set:{status: 'Open'}}, {multi:true})
		.exec(function (err, milestones){
			//console.log("INACTIVE: "+milestones);
		});
}

// DESCRIPTION:
//			changes status of the Milestone object from "Open" or "Pending Action"
//			to "Pending Action" if its effective date has passed
// INPUT: none
// OUTPUT: none
function makeMilestonePendingAndEmail(){
	var today = moment();// SHOULD NOT BE IN UTC FORMAT!!!
						//mongoose searches and converts staff to local
	cleanDates(today);
	//today.add(6,'d'); //for testing, try to see if stuff has changes
	console.log('today: '+today.toString());
	
	Milestone
		.update({$or:[{status:"Open"}, {status:"Pending Action"}] , date:{$lt:today}}, {$set:{status: 'Pending Action'}}, {multi:true})
		.populate('monitors')
		.exec(function (err, milestones){
			console.log("REMIND THEM: "+milestones);
			var l = milestones.length;
			for (var i=0; i<l; i++){
				//comment out once we can add monitors
				//sendEmailReminder(milestones[i].monitors, milestones[i].bet, milestones[i].author);
			}
		});
}
// TBD - need to think more about the transition logic!
// DESCRIPTION:
//			changes status of the Bet object based on the Milestones
// INPUT: none
// OUTPUT: none
function changeBetStatus(){
	var today = moment();// SHOULD NOT BE IN UTC FORMAT!!!
						//mongoose searches and converts staff to local
	
	cleanDates(today);
	//not started --> Action Required
	Bet
		.update({status: "Not Started", startDate: {$gt: today}}, {$set:{status: 'Action Required'}})
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
					sendEmailAuthor(author, bet_id, 'Open');
				}
			}
		});

	// after dropDate
	Bet
		.update({status: "Action Required", dropDate: {$gt: today}}, {$set:{status: 'Dropped'}})
		.populate('author')
		.exec(function(err, bets){
			if (err){
				console.log("Error while dropping bet: "+err);
				return;
			}
			var l = bets.length;
			for (var i=0; i<l; i++){
				var bet_id = bets[i]._id;

				Milestone
					.update({bet: bet_id, $or:[{status: "Open"}, {status: "Inactive"}, {status: 'Pending Action'}]}, {$set:{status: 'Closed'}}, {multi:true})
					.exec(function (err, milestones){
						if (err){
							console.log("Error closing milestones: "+err);
						}
					});
				var author = bets[i].author;
				sendEmailAuthor(author, bet_id, 'Dropped');
			}
		});
}
//Testing function:
//sendEmailAuthor({username:"D", email:"mukushev@mit.edu"}, mongoose.Types.ObjectId(), 'Dropped');


// DESCRIPTION:
//			function run inside the cron job
// INPUT: none
// OUTPUT: none
function overnightCheck(){
	makeMilestoneActive();
	makeMilestonePendingAndEmail();
	changeBetStatus();
}

//======================== Emailing out =========================
//DESCRIPTION:
//		send emails to the author of the bet
//INPUT: 
//		author - User json object
//		bet_id - ObjectId of the changed Bet
//		status - String, specifies the email body

//OUTPUT:
//		nothing
function sendEmailAuthor(author, bet_id, status){
	var receiver = author.email;
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

//DESCRIPTION:
//		send emails to the list of  monitors for each milestone
//INPUT: 
//		monitors - list of json User objects
//		bet_id - ObjectId of the bet the milestone belongs to
//		auhtor - User json object

//OUTPUT:
//		nothing
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
//DESCRIPTION: 
//		form a list of emails
//INPUT: 
//		monitors - list of json User objects

//OUTPUT:
//		list of emails
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

//======================== API route methods =========================

//Test sending remainders
//sendEmailReminder([{email:'d.mukusheva@gmail.com'}], 'dummy',{username: "test"});

// GET /milestones (TEMP FUNCTION FOR TESTING PURPOSES)
// Request parameters/body:
//     - none 
// Response:
//     - success: true if all the milestones are successfully retrieved
//     - content: all milestone objects returned as a JSON
//     - err: on failure, an error message
router.get('/', function(req, res) {
	Milestone.find({}, function(err, doc){
		if (err){
			utils.sendErrResponse(res,500, "Cannot retrieve Milestones");
		}else{
			utils.sendSuccessResponse(res,doc);
		}
	});
});

/*// GET /milestones/:bet_id   //NOTE: duplication
// Request parameters/body: (note req.body for forms)
//     - bet_id: a String representation of the MongoDB _id of the bet
// Response:
//     - success: true if the milestones are successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:bet_id', function(req, res) {
  res.send('respond with a resource');
});*/

// PUT /milestones/:milestone_id
// Request parameters:
//     - milestones_id: a String representation of the MongoDB _id of the milestone
// Response:
//     - success: true if the status of the milestone with ID milestone_id is successfully edited
//				  possible statuses include: Inactive, Open, Closed, Pending Action
//     - content: the milestone object with ID milestone_id
//     - err: on failure, an error message
router.put('/:milestone_id', function(req, res) {
	var milestone_id = req.params.milestone_id;
	var new_status = req.body.status; //success, failed
	Milestone
		.findById(milestone_id)
		.populate('bet author')
		.exec(function(err, milestone){
			if (err){
				utils.sendErrResponse(res,500, "Cannot retrieve Milestone with provided ID");
			}else{
				milestone.status = new_status;
				milestone.save(function(err, savedmilestone){
					if (err){
						utils.sendErrResponse(res, 500, "Cannot save the milestone")
					}
					//new status = success
					if (new_status === 'Success'){
						Milestone
							.find({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]})
							.exec(function(err, milestones){
								if (err){
									utils.sendErrResponse(res, 500, "Cannot find fraternal milestones")
								}
								if (milestones.length === 0){
									milestone.bet.status = "Succeeded";
									milestone.bet.save(function(err){
										if (err){
											utils.sendErrResponse(res, 500, "could not update bet status");
										}
										// send email to author
										//sendEmailAuthor(milestone.author, milestone.bet._id, "Succeeded");
										utils.sendSuccessResponse(res, savedmilestone);
									})
								}
								else{
									// user received checkoff but bet still ongoing
									utils.sendSuccessResponse(res, savedmilestone);
								}
							});
					}
					//other status: failed
					else if (new_status==="Failed"){
						Milestone
							.update({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]}, {$set:{status:'Closed'}}, {multi:true})
							.exec(function(err){
								if(err){
									utils.sendErrResponse(res, 500, "Cannot find fraternal milestones")
								}
								milestone.bet.status = "Failed";
								milestone.bet.save(function (err){
									if (err){
										utils.sendErrResponse(res, 500, err);
									}
									//send email
									//sendEmailAuthor(milestone.author, milestone.bet._id, "Failed");
									//console.log("EMAIL DANA");
									//sendEmailAuthor({username:"D", email:"mukushev@mit.edu"}, milestone.bet._id, "Failed");
									//charge money here
									utils.sendSuccessResponse(res, savedmilestone);

								});

								
							});
					}
					else{
						utils.sendSuccessResponse(res, savedmilestone);
					}
				});
			}
		});
});


module.exports = router;