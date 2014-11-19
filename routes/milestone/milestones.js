var express = require('express');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var time = require('time');
var moment = require('moment');
moment().format();
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

//linking collections and utils 
var utils = require('../../utils/utils')
var emailNotifier = require('../../utils/email');
var changeStatus = require('../../utils/changeStatus')
var User = require('../../models/User');
var MoneyRecord = require('../../models/MoneyRecord');
var Bet = require('../../models/Bet');
var Milestone = require('../../models/Milestone');


//===================     CRON JOB      ===================
// server's timezone
var timezone = (new time.Date()).getTimezone();

var job = new CronJob({
  cronTime: '20 41 20 * * *', //runs everyday at 1 min after midnight
  onTick: function() {
  	//testing: 
  	//sendEmailReminder([{email:'mukushev@mit.edu'}], 'dummy',{username: "test"});
  	console.log("CRON JOB AT ACTION");
  	changeStatus.overnightCheck();	
  },
  start: false,
  timeZone: timezone
});
//comment out in case don't 
job.start();



//======================== API route methods =========================


//get all milestones in the DB
router.get('/', function(req, res) {
	Milestone.find({}, function(err, doc){
		if (err){
			utils.sendErrResponse(res,500, "Cannot retrieve Milestones");
		}else{
			utils.sendSuccessResponse(res,doc);
		}
	});
});

// When milestone has failed, create a charge to the user's account

//===================     Helpers        ===================
/*
Charge money once one of the milestones is failed
*/
var updatePayments = function(author_id, bet_id, res) {
	Bet.findOne({_id:bet_id})
	   .exec(function(err, bet) {
	   		if (err) {
				utils.sendErrResponse(res, 500, 'An error occurred while looking up the bet');
			} else if (bet){

				var amount = bet.amount / bet.monitors.length;
				var recordRequests = [];
				console.log("amount is this guy:", amount, bet.amount, bet.monitors, bet.monitors.length, "\n");

				//prepare money record for each monitor of the bet
				for (var i = 0; i <bet.monitors.length; i++) {
					var request = {
						from: new ObjectId(author_id),
						to: bet.monitors[i],
						amount: amount,
						requested: false
					};
					recordRequests.push(request);
				}
				//insert them into the DB
				MoneyRecord.create(recordRequests, function(err, records) {
					if(err) {
						utils.sendErrResponse(res, 500, "Cannot create the payment records");
					} else {
						utils.sendSuccessResponse(res, records);
					}
				});

			} else {
				utils.sendErrResponse(res, 500, 'There is no such bet like that');
			}
		});
	
}

//=================== API route methods ===================


//get all milestones in the DB
router.get('/', function(req, res) {
	Milestone.find({}, function(err, doc){
		if (err){
			utils.sendErrResponse(res,500, "Cannot retrieve Milestones");
		}else{
			utils.sendSuccessResponse(res,doc);
		}
	});
});




//!! FUNCTION FOR CHECKING OFF

/*
Change the status of Milestone object: 
new_status = "Success" or "Failed"
	if new_status="Failed", 
	  then the entire bet is failed and the user gets notified by email and charged
	if new_status = "Success" and all other milestones were checkoff/failed,
	  then the entire bet succeeded and user get's notified by email
*/

router.put('/:milestone_id', function(req, res) {
	var milestone_id = req.params.milestone_id;
	var new_status = req.body.status; //Success or Failed
	var test = req.body.test;
	
	Milestone
		.findById(milestone_id)
		.populate('bet author')
		.exec(function(err, milestone){
			if (err){
				console.log("1");
				utils.sendErrResponse(res,500, "Cannot retrieve Milestone with provided ID");
			}else{
				milestone.status = new_status;
				milestone.save(function(err, savedmilestone){
					if (err){
						console.log("2");
						utils.sendErrResponse(res, 500, "Cannot save the milestone")
					}
					//new status = success
					if (new_status === 'Success'){
						Milestone
							.find({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]})
							.exec(function(err, milestones){
								if (err){
									console.log("3");
									utils.sendErrResponse(res, 500, "Cannot find fraternal milestones")
								}
								if (milestones.length === 0){ //means all other milestones got checked
									milestone.bet.status = "Succeeded";
									milestone.bet.save(function(err){
										if (err){
											console.log("4");
											utils.sendErrResponse(res, 500, "could not update bet status");
										}
										// send email to author
										if (!test){
											console.log("5");
											changeStatus.sendEmailAuthor(milestone.author, milestone.bet._id, "Succeeded");
										}
										console.log("6");
										utils.sendSuccessResponse(res, savedmilestone);
									})
								}
								else{
									// user received checkoff but bet still ongoing
									console.log("7");
									utils.sendSuccessResponse(res, savedmilestone);
								}
							});
					}
					//other status =  failed
					else if (new_status==="Failed"){
						Milestone
							.update({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]}, {$set:{status:'Closed'}}, {multi:true})
							.exec(function(err){
								if(err){
									console.log("8");
									utils.sendErrResponse(res, 500, "Cannot find fraternal milestones")
								}
								milestone.bet.status = "Failed";
								milestone.bet.save(function (err){
									if (err){
										console.log("9");
										utils.sendErrResponse(res, 500, err);
									}
									if (!test){// not in test mode
										console.log("10");
										// UPDATE PAYMENT STUFF, notify author
										console.log("milestone.author", milestone.author);
										changeStatus.sendEmailAuthor(milestone.author, milestone.bet._id, "Failed");
										updatePayments(milestone.author._id, milestone.bet, res);
									
									} else {
										//test mode, just send success
										//console.log("EMAIL DANA");
										//sendEmailAuthor({username:"D", email:"mukushev@mit.edu"}, milestone.bet._id, "Failed");
										console.log("11");
										utils.sendSuccessResponse(res, savedmilestone);
									}
								});								
							});
					}
					else{
						//should never get here, other statuses shouldn't be sent
						console.log("12");
						utils.sendSuccessResponse(res, savedmilestone);
					}
				});
			}
		});
});






module.exports = router;