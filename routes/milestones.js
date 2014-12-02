var express = require('express');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var time = require('time');
var moment = require('moment');
moment().format();
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

//linking collections and utils 
var utils = require('../utils/utils')
var emailNotifier = require('../utils/email');
//var changeStatus = require('../utils/changeStatus');c
var MoneyRecord = require('../models/MoneyRecord');
var Bet = require('../models/Bet');
var MonitorRequest = require('../models/MonitorRequest');
var Milestone = require('../models/Milestone');



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
// var updatePayments = function(author_id, bet_id, res) {
// 	Bet.findOne({_id:bet_id})
// 	   .exec(function(err, bet) {
// 	   		if (err) {
// 				utils.sendErrResponse(res, 500, 'An error occurred while looking up the bet');
// 			} else if (bet){

// 				var amount = bet.amount / bet.monitors.length;
// 				var recordRequests = [];
// 				console.log("amount is this guy:", amount, bet.amount, bet.monitors, bet.monitors.length, "\n");

// 				//prepare money record for each monitor of the bet
// 				for (var i = 0; i <bet.monitors.length; i++) {
// 					var request = {
// 						from: new ObjectId(author_id),
// 						to: bet.monitors[i],
// 						amount: amount,
// 						requested: false
// 					};
// 					recordRequests.push(request);
// 				}
// 				//insert them into the DB
// 				MoneyRecord.create(recordRequests, function(err, records) {
// 					if(err) {
// 						utils.sendErrResponse(res, 500, "Cannot create the payment records");
// 					} else {
// 						utils.sendSuccessResponse(res, records);
// 					}
// 				});

// 			} else {
// 				utils.sendErrResponse(res, 500, 'There is no such bet like that');
// 			}
// 		});
	
// }

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

	Milestone.checkoff(milestone_id, new_status, test, function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);      
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
    });
});

module.exports = router;