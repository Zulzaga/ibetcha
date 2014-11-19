var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var milestoneStatus = [
	'Inactive', //not yet reached the effective date
	'Open', //awaiting checkoff, today is effective date
	'Pending Action', //still requires action
	'Success',//success checkoff
	'Failed', // failed checkoff
	'Closed' // bet Drop date passed
];

//Milestones Schema
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

//Bindings
var Milestone = mongoose.model('Milestone', milestonesSchema);

module.exports = Milestone;
