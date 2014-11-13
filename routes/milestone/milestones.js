var express = require('express');
var CronJob = require('cron').CronJob;
var time = require('time');
var router = express.Router();

//linking collections and utils 
var utils = require('../../utils/utils')
var emailNotifier = require('../../utils/email');

var User = require('../../models/User');
var Bet = require('../../models/Bet');
var Milestone = require('../../models/Milestone');


//AUTOMATED LOGIC
var timezone = (new time.Date()).getTimezone();
var job = new CronJob({
  cronTime: '00 46 21 * * *',
  onTick: function() {
  	//sendEmailReminder([{email:'mukushev@mit.edu'}], 'dummy',{username: "test"});	
  },
  start: false,
  timeZone: timezone
});
job.start();

//====== function that run inside the cron job =========
function makeMilestoneActive(){
	var today = new Date();
	Milestone
		.find({status:"Inactive", date:{$eq:today}})
		.populate('bet')
		.exec(function (err, milestones){
			console.log("INACTIVE: "+milestones);
		});
}
makeMilestoneActive();
function overnightCheck(){

}

//======================== Helpers =========================

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