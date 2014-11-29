var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
var MonitorRequest = require('./MonitorRequest');
var changeStatus = require('../utils/changeStatus');

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

//Bindings
var Milestone = mongoose.model('Milestone', milestonesSchema);

module.exports = Milestone;
