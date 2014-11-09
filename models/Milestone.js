var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var milestoneStatus = [
	'Inactive', //not yet reached the date
	'Open', //awaiting checkoff
	'Closed', // got checkoff
	'Pending Action' //still requires action
];

//Milestones Schema
var milestonesSchema = new Schema({
	date:Date,
	
	author:{
		type: ObjectId,
		ref: 'User'
	},
	status:{
		type: String,
		enum: milestoneStatus
	},
	monitors:[{
		type: ObjectId,
		ref: 'User'
	}]
});

//Bindings
var Milestone = mongoose.model('Milestone', milestonesSchema);

module.exports = Milestone;
