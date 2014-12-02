var express = require('express');
var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var time = require('time');
var moment = require('moment');
var async = require('async');
moment().format();
var router = express.Router();

//linking collections and utils 
var emailNotifier = require('./utils/emails');
var User = require('./models/User');
var Bet = require('./models/Bet');
var Milestone = require('./models/Milestone');

module.exports = {
	  start: function(){
	  	overnightCheck();
	  }
}

//================== Cron job details =========

/*
When bet is dropped, make NOT checked off milestones Closed
*/
function makeMilestoneClosed(callback){
	console.log("entered makeMilestoneClosed");
	Milestone
		.find({$or:[{status:"Open"}, {status:"Pending Action"}, {status:"Inactive"}]})
		.populate('bet')
		.exec(function (err, milestones){
			var l = milestones.length;
			for (var i=0; i<l; i++){
				//look if bet was dropped
				if (milestones[i].bet.status==="Dropped"){
					milestones[i].status = "Closed";
					milestones[i].save(function(err){
						if (err){
							console.log("Error while closing milestone: "+err);
							return;
						}
					});
				}
				else{
					//do nothing
				}
			}
			console.log("exited makeMilestoneClosed");
			callback();
			return;
		});
}

/*
	For those milestones whose effective date is today,
	change status from "Inactive" to "Open"
*/
function makeMilestoneActive(callback){
	console.log("entered makeMilestoneActive");
	var today = getToday();
	var tomorrow = getTomorrow();
	Milestone
		.update({status:"Inactive", date:{$gte:today, $lt: tomorrow}}, {$set:{status: 'Open'}}, {multi:true})
		.exec(function (err, milestones){
			if (err){
				console.log("Error activating the milestone: "+ err);
				return;
			}
			else{
			//nothing should happen
			console.log("exited makeMilestoneActive");
			callback();
			return;
			}
		});
}

/*
	Change status of the Milestone object from "Open" or "Pending Action"
	to "Pending Action" if its effective date passed and no one checked it
*/
function makeMilestonePendingAndEmail(callback){
	console.log("entered makeMilestonePendingAndEmail");
	var today = getToday();
	var tomorrow = getTomorrow();
	Milestone
		.find({$or:[{status:"Open"}, {status:"Pending Action"}] , date:{$lt:today}})
		.populate('bet author')
		.exec(function (err, milestones){
			var l = milestones.length;
			for (var i=0; i<l; i++){
				(function(i) {
					milestones[i].status = "Pending Action";
					milestones[i].save(function(err){
						if (err){
							console.log("Error while making Milestone pending: "+err);
							return;
						}
						else{
							emailNotifier.sendEmailReminder(milestones[i].bet.monitors, milestones[i].bet._id, milestones[i].author);	
						}
					});
				})(i);
				
			}
			console.log("exited makeMilestonePendingAndEmail");
			callback();
			return;
		});
}

/*
   Change bets according to their start, end and drop dates
     not started -> action required (if today is start date) + sends email
     any status  -> dropped (if today is drop date) + sends email   
*/
function changeBetStatus(callback){
	console.log("entered changeBetStatus");
	var today = getToday();
	var tomorrow = getTomorrow();
	//2 cases for transitions

	//case 1: Not Started --> Action Required,
	function notStartedToActionRequired(callback){
		console.log("entered notStartedToActionRequired");
		//enough monitors, good to go
		Bet
			.update({status: "Not Started", startDate: {$gte:today, $lt: tomorrow}, $or:[{monitors: {$size: 3}}, {monitors: {$size: 4}}, {monitors: {$size: 5}}]}, {$set:{status:"Action Required"}}, {multi:true})
			.exec(function(err, bets1){
				if (err){
					console.log("Error while activating bet: "+err);
					return;
				}
				else{
					// handle bets with number of monitors < 3:
					// Inactive ----> Dropped
					Bet
						.update({status: "Not Started", startDate: {$gte:today, $lt: tomorrow}, $or: [{monitors: {$size: 0}}, {monitors: {$size: 1}}, {monitors: {$size: 2}}]}, {$set:{status:"Dropped"}}, {multi:true})
						.exec(function(err, bets){
							if (err){
								console.log("Error while activating bet: "+err);
								return;
							}
						
							console.log("exited notStartedToActionRequired")
							callback();
						});
				}
			});
	}
	//case 2: Anything --> Dropped (after dropped date)
	function dropBetAfterDropDate(callback){
		console.log("entered dropBetAfterDropDate");
		Bet
			.update({status: 'Action Required', dropDate: {$lt: today}}, {$set:{status: "Dropped"}}, {multi:true})
			.exec(function(err, bets3){
				if (err){
					console.log("Error while dropping bet: "+err);
					return;
				}
				console.log("exited dropBetAfterDropDate");
				callback();
				return;
			});
		
	}

	//make sure that case 1 and case 2 run sequentially
	var operations = [];
	operations.push(notStartedToActionRequired);
	operations.push(dropBetAfterDropDate);
	async.series(operations, function(err, results){
		if (err){
			console.log("Error changin bet status: "+err);
			return;
		}
		console.log("Exited changeBetStatus");
		callback();
		return;
	});
	return;
}


//make database changes at midnight
var overnightCheck = function(){
	console.log("about to start cron series");
	//console.log("async: "+async.series);
	var operations = [];
	operations.push(changeBetStatus);
	operations.push(makeMilestoneClosed);
	operations.push(makeMilestoneActive);
	operations.push(makeMilestonePendingAndEmail);
	async.series(operations, function(err, results){
		if (err){
			console.log('smth wrong '+err);
		}    		
			console.log('CRON JOB FINISHED');
		});
}

//======================== Helpers =========================
function getToday(){
	var today = moment();
	today.millisecond(0);
	today.second(0);
	today.minute(0);
	today.hour(0);
	return today;
}
function getTomorrow(){
	var today = moment();
	today.add(1, 'd');
	today.millisecond(0);
	today.second(0);
	today.minute(0);
	today.hour(0);
	return today;
}


