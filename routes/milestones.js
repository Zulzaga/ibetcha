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
//var changeStatus = require('../utils/changeStatus');c
var PaymentRequest = require('../models/PaymentRequest');
var Bet = require('../models/Bet');
var MonitorRequest = require('../models/MonitorRequest');
var Milestone = require('../models/Milestone');

//================== Helper methods ===============================

// function for ajax response calls
var ajaxResponse = function(err, code, content, res){
    if (err) {
        utils.sendErrResponse(res, code, content);
    } else{
        utils.sendSuccessResponse(res, content);
    }
};

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

	Milestone.checkoff(milestone_id, new_status, test, ajaxResponse, res);
});

module.exports = router;