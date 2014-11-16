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
var changeStatus = require('../../utils/changeStatus')

var User = require('../../models/User');
var Bet = require('../../models/Bet');
var Milestone = require('../../models/Milestone');

// TODO:
// Dummy money charging mechanishm (in PUT method when failed) 


//================== CRON JOB ==================
// server's timezone
var timezone = (new time.Date()).getTimezone();

var job = new CronJob({
  cronTime: '00 01 00 * * *', //runs everyday at 1 min after midnight
  onTick: function() {
  	//testing: 
  	//sendEmailReminder([{email:'mukushev@mit.edu'}], 'dummy',{username: "test"});

  	changeStatus.overnightCheck();	
  },
  start: false,
  timeZone: timezone
});
//comment out whenever ready
//job.start();


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

//FUNCTION USED FOR CHECKING OFF

//changes the status of milestone object: new_status = "Success" or "Failed"

//if new_status="Failed", then the entire bet is failed and the user gets notified by email
//if new_status = "Success" and all other milestones were checkoff/failed,
//then the entire bet succeeded and user get's notified by email
router.put('/:milestone_id', function(req, res) {
	var milestone_id = req.params.milestone_id;
	var new_status = req.body.status; //Success or Failed
	var test = req.body.test;
	
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
								if (milestones.length === 0){ //means all other milestones got checked
									milestone.bet.status = "Succeeded";
									milestone.bet.save(function(err){
										if (err){
											utils.sendErrResponse(res, 500, "could not update bet status");
										}
										// send email to author
										if (!test){
											changeStatus.sendEmailAuthor(milestone.author, milestone.bet._id, "Succeeded");
										}
										utils.sendSuccessResponse(res, savedmilestone);
									})
								}
								else{
									// user received checkoff but bet still ongoing
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
									utils.sendErrResponse(res, 500, "Cannot find fraternal milestones")
								}
								milestone.bet.status = "Failed";
								milestone.bet.save(function (err){
									if (err){
										utils.sendErrResponse(res, 500, err);
									}
									//send email
									if (!test){
										changeStatus.sendEmailAuthor(milestone.author, milestone.bet._id, "Failed");
									}

									//console.log("EMAIL DANA");
									//sendEmailAuthor({username:"D", email:"mukushev@mit.edu"}, milestone.bet._id, "Failed");
									//charge money here
									utils.sendSuccessResponse(res, savedmilestone);

								});

								
							});
					}
					else{
						//should never get here
						utils.sendSuccessResponse(res, savedmilestone);
					}
				});
			}
		});
});



module.exports = router;