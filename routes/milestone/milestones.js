var express = require('express');
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
// - changeBetStatus 
// - milestones/:milestone_id PUT method: run additional check on the corresponding
// 		Bet object to see if the change in Milestone somehow affected the Bet status:
//		e.g. to see if the Bet is succesfully completed or failed and
//		send an email asking to confirm money transfer

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
		.update({$or:[{status:"Open"}, {status:"Pending Action"}] , date:{$lt:today}}, {$set:{status: 'Penging Action'}}, {multi:true})
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
}

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
//		send emails to the list of  monitors for each milestone
//INPUT: 
//		monitors - list of json User objects
//		bet_id - bet_id the milestone belong to
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
	var new_status = req.body.status;
	Milestone.findById(milestone_id, function(err, doc){
		if (err){
			utils.sendErrResponse(res,500, "Cannot retrieve Milestone with provided ID");
		}else{
			doc.status = new_status;
			doc.save(function(err){
				if (err){
					utils.sendErrResponse(res,500, "Cannot retrieve Milestone with provided ID");
				}
				utils.sendSuccessResponse(res,doc);
			});
		}
	})
});

module.exports = router;