var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
var MonitorRequest = require('./MonitorRequest');
var changeStatus = require('../utils/changeStatus');
var emailNotifier = require('../utils/email');


var milestoneStatus = [
	'Inactive', //not yet reached the effective date
	'Open', //awaiting checkoff, today is effective date
	'Pending Action', //still requires action
	'Success',//success checkoff
	'Failed', // failed checkoff
	'Closed' // bet Drop date passed
];

//========================== SCHEMA DEFINITION ==========================
var milestonesSchema = new Schema({
	date: Date,
	
	bet:{
		type: ObjectId,
		ref: 'Bet'
	},
	author:{
		type: ObjectId,
		ref: 'User'
	},
	status:{
		type: String,
		enum: milestoneStatus
	}
});

//========================== SCHEMA STATICS ==========================
milestonesSchema.statics.findPending = function(bet_id, callback){
  	this.find({bet:bet_id, $or:[{status:'Pending Action'}, {status:'Open'}]})
       .populate('author monitors')
       .sort({date:-1})
       .exec(function(error, milestones) {
          	if(error) {
            	callback(true, 500, error);
          	} else {
            	callback(false, 200, milestones);
          	}
		});
}

milestonesSchema.statics.updatePayments = function(author_id, bet_id, callback) {
	Bet.findOne({_id:bet_id})
	   .exec(function(err, bet) {
	   		if (err) {
				callback(true, 500, 'An error occurred while looking up the bet');
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
						callback(true, 500, "Cannot create the payment records");
					} else {
						callback(false, 200, records);
					}
				});

			} else {
				callback(true, 500, 'There is no such bet like that');
			}
		});
}

milestonesSchema.statics.checkoff = function(milestone_id, new_status, test, callback) {
	Milestone
		.findById(milestone_id)
		.populate('bet author')
		.exec(function(err, milestone){
			if (err){
				console.log("1");
				callback(true,500, "Cannot retrieve Milestone with provided ID");
			}else{
				milestone.status = new_status;
				milestone.save(function(err, savedmilestone){
					if (err){
						console.log("2");
						callback(true, 500, "Cannot save the milestone")
					}
					//new status = success
					if (new_status === 'Success'){
						Milestone
							.find({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]})
							.exec(function(err, milestones){
								if (err){
									console.log("3");
									callback(true, 500, "Cannot find fraternal milestones")
								}
								if (milestones.length === 0){ //means all other milestones got checked
									milestone.bet.status = "Succeeded";
									milestone.bet.save(function(err){
										if (err){
											console.log("4");
											callback(true, 500, "could not update bet status");
										}
										// send email to author
										if (!test){
											console.log("5");
											changeStatus.sendEmailAuthor(milestone.author, milestone.bet._id, "Succeeded");
										}
										console.log("6");
										callback(false, 200, savedmilestone);
									})
								}
								else{
									// user received checkoff but bet still ongoing
									console.log("7");
									callback(false, 200, savedmilestone);
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
									callback(true, 500, "Cannot find fraternal milestones")
								}
								milestone.bet.status = "Failed";
								milestone.bet.save(function (err){
									if (err){
										console.log("9");
										callback(true, 500, err);
									}
									if (!test){// not in test mode
										console.log("10");
										// UPDATE PAYMENT STUFF, notify author
										console.log("milestone.author", milestone.author);
										MonitorRequest.remove({ "bet": milestone.bet._id }, function(err, requests) {
											if (err) {
												callback(true, 500, err);
											} else {
												console.log(requests);
												console.log("Successfully deleted all monitor requests!.");
												changeStatus.sendEmailAuthor(milestone.author, milestone.bet._id, "Failed");
												Milestones.updatePayments(milestone.author._id, milestone.bet, callback);
											}
										});
									
									} else {
										//test mode, just send success
										//console.log("EMAIL DANA");
										//sendEmailAuthor({username:"D", email:"mukushev@mit.edu"}, milestone.bet._id, "Failed");
										console.log("11");
										callback(false, 200, milestone);
									}
								});								
							});
					}
					else{
						//should never get here, other statuses shouldn't be sent
						console.log("12");
						callback(false, 200, savedmilestone);
					}
				});
			}
		});
}

//Bindings
var Milestone = mongoose.model('Milestone', milestonesSchema);

module.exports = Milestone;
