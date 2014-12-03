var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
var MonitorRequest = require('./MonitorRequest');
var Milestone = require('./Milestone');
var PaymentRequest = require('./PaymentRequest');
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
milestonesSchema.statics.findPending = function(bet_id, responseCallback, res) {
  	this.find({ bet: bet_id, $or:[{ status: 'Pending Action'}, { status: 'Open' }]})
       .populate('author monitors')
       .sort({date:-1})
       .exec(function(error, milestones) {
          	if (error) {
            	responseCallback(true, 500, error, res);
          	} else {
            	responseCallback(false, 200, milestones, res);
          	}
		});
}

// update the payment
milestonesSchema.statics.updatePayments = function(author_id, bet_id, responseCallback, res) {
	mongoose.model('Bet').findById(bet_id, function(err, bet) {
   		if (err) {
			responseCallback(true, 500, 'An error occurred while looking up the bet', res);
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
			PaymentRequest.create(recordRequests, function(err, records) {
				if (err) {
					responseCallback(true, 500, "Cannot create the payment records", res);
				} else {
					responseCallback(false, 200, records, res);
				}
			});
		} else {
			responseCallback(true, 500, 'There is no such bet like that', res);
		}
	});
}


//checkoff a user for a particular milestone:
//* handles logic for the case where the checkoff is a "fail": closes bet and sends payment requests
//* if checkoff is the last one required, marks the bet as success and notifies user
milestonesSchema.statics.checkoff = function(milestone_id, new_status, test, responseCallback, res) {
	Milestone
		.findById(milestone_id)
		.populate('bet author')
		.exec(function(err, milestone){
			if (err) {
				responseCallback(true, 500, "Cannot retrieve Milestone with provided ID", res);
			} else{
				milestone.status = new_status;
				milestone.save(function(err, savedmilestone){
					if (err){
						responseCallback(true, 500, "Cannot save the milestone", res)
					} else if (new_status === 'Success'){ // logic for success case
						handle_success(milestone, responseCallback, res);
					} else if (new_status==="Failed"){
						handle_failure(milestone, responseCallback, res);
					} else{
						//should never get here, other statuses shouldn't be sent
						responseCallback(false, 200, savedmilestone, res);
					}
				});
			}
		});
}

//=============================== HELPERS ===============================

//handles the case where a successful checkoff is given to a milestone
//if the bet is the last to receive a checkoff, it also updates the bet status
var handle_success = function(milestone, responseCallback, res){
	Milestone
		.find({bet: milestone.bet._id, $or:[{ status:'Pending Action' }, { status:'Inactive' }, {status:'Open'}]})
		.exec(function(err, milestones){
			if (err){
				responseCallback(true, 500, "Cannot find fraternal milestones", res)
			}
			if (milestones.length === 0){ //means all other milestones got checked
				milestone.bet.status = "Succeeded";
				milestone.bet.save(function(err){
					if (err){
						responseCallback(true, 500, "could not update bet status", res);
					}
					// send email to author
					emailNotifier.sendEmailAuthor(milestone.author, milestone.bet._id, "Succeeded");
					responseCallback(false, 200, milestone, res);
				})
			}
			else{
				// user received checkoff but bet still ongoing
				responseCallback(false, 200, milestone, res);
			}
		});
}

//handles the case where a milestone is failed.
//if there are remaining milestones, it closes those, so no checking off is possible
var handle_failure = function(milestone, responseCallback, res){
	Milestone
		.update({bet: milestone.bet._id, $or:[{status:'Pending Action'}, {status:'Inactive'}, {status:'Open'}]}, {$set:{status:'Closed'}}, {multi:true})
		.exec(function(err){
			if (err){
				responseCallback(true, 500, "Cannot find fraternal milestones", res)
			}
			handle_failure_helper(milestone, responseCallback, res);
		});
}


//handles notifying the user and proceeding to make payment objects for monitors and the betcher
var handle_failure_helper = function(milestone, responseCallback, res){
	milestone.bet.status = "Failed";
		milestone.bet.save(function (err){
			if (err){
				responseCallback(true, 500, err, res);
			}
			
			// UPDATE PAYMENT STUFF, notify author
			MonitorRequest.remove({ "bet": milestone.bet._id }, function(err, requests) {
				if (err) {
					responseCallback(true, 500, err, res);
				} else {
					Milestone.updatePayments(milestone.author._id, milestone.bet._id, responseCallback, res);
				}
			});
		});	
}

//Bindings
var Milestone = mongoose.model('Milestone', milestonesSchema);

module.exports = Milestone;
