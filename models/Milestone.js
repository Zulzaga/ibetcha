var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
var MonitorRequest = require('./MonitorRequest');
var Milestone = require('./Milestone');
var MoneyRecord = require('./MoneyRecord');
var Bet = require('./Bet');
var emailNotifier = require('../utils/emails');


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
// find all pending milestones whose bets are open
milestonesSchema.statics.findPending = function(bet_id, callback) {
  	this.find({ bet: bet_id, $or:[{ status: 'Pending Action'}, { status: 'Open' }]})
       .populate('author monitors')
       .sort({date:-1})
       .exec(function(error, milestones) {
          	if (error) {
            	callback(true, 500, error);
          	} else {
            	callback(false, 200, milestones);
          	}
		});
}

// update the payment
milestonesSchema.statics.updatePayments = function(author_id, bet_id, callback) {
	mongoose.model('Bet').findById(bet_id, function(err, bet) {
   		if (err) {
			callback(true, 500, 'An error occurred while looking up the bet');
		} else if (bet) {
			var amount = bet.amount / bet.monitors.length;
			var recordRequests = [];

			//prepare money record for each monitor of the bet
			for (var i = 0; i < bet.monitors.length; i++) {
				var request = {
					from: author_id,
					to: bet.monitors[i],
					amount: amount,
					requested: false
				};
				recordRequests.push(request);
			}

			//insert them into the DB
			MoneyRecord.create(recordRequests, function(err, records) {
				if (err) {
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



//handles the case where a successful checkoff is given to a milestone
//if the bet is the last to receive a checkoff, it also updates the bet status
milestonesSchema.statics.handle_success = function(milestone, callback){
	Milestone
		.find({bet: milestone.bet._id, $or:[{ status:'Pending Action' }, { status:'Inactive' }, {status:'Open'}]})
		.exec(function(err, milestones){
			if (err){
				callback(true, 500, "Cannot find fraternal milestones")
			}
			if (milestones.length === 0){ //means all other milestones got checked
				milestone.bet.status = "Succeeded";
				milestone.bet.save(function(err){
					if (err){
						callback(true, 500, "could not update bet status");
					}
					// send email to author
					emailNotifier.sendEmailAuthor(milestone.author, milestone.bet._id, "Succeeded");
					callback(false, 200, savedmilestone);
				})
			}
			else{
				// user received checkoff but bet still ongoing
				callback(false, 200, savedmilestone);
			}
		});
}

//handles the case where a milestone is failed.
//if there are remaining milestones, it closes those, so no checking off is possible
milestonesSchema.statics.handle_failure = function(milestone, callback){
	Milestone
		.update({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]}, {$set:{status:'Closed'}}, {multi:true})
		.exec(function(err){
			if(err){
				callback(true, 500, "Cannot find fraternal milestones")
			}
			Milestone.handle_failure_helper(milestone, callback);
		});
}


//handles notifying the user and proceeding to make payment objects for monitors and the betcher
milestonesSchema.statics.handle_failure_helper = function(milestone,callback){
	milestone.bet.status = "Failed";
		milestone.bet.save(function (err){
			if (err){
				callback(true, 500, err);
			}
			
			// UPDATE PAYMENT STUFF, notify author
			MonitorRequest.remove({ "bet": milestone.bet._id }, function(err, requests) {
				if (err) {
					callback(true, 500, err);
				} else {
					Milestone.updatePayments(milestone.author._id, milestone.bet._id, callback);
				}
			});
		});	
}


//checkoff a user for a particular milestone:
//* handles logic for the case where the checkoff is a "fail": closes bet and sends payment requests
//* if checkoff is the last one required, marks the bet as success and notifies user
milestonesSchema.statics.checkoff = function(milestone_id, new_status, test, callback) {
	Milestone
		.findById(milestone_id)
		.populate('bet author')
		.exec(function(err, milestone){
			if (err){
				callback(true,500, "Cannot retrieve Milestone with provided ID");
			}else{
				milestone.status = new_status;
				milestone.save(function(err, savedmilestone){
					if (err){
						callback(true, 500, "Cannot save the milestone")
					}
					if (new_status === 'Success'){ // logic for success case
						Milestone.handle_success(milestone, callback);
					}
					else if (new_status==="Failed"){
						Milestone.handle_failure(milestone, callback);
					}
					else{
						//should never get here, other statuses shouldn't be sent
						callback(false, 200, savedmilestone);
					}
				});
			}
		});
}

//Bindings
var Milestone = mongoose.model('Milestone', milestonesSchema);

module.exports = Milestone;
