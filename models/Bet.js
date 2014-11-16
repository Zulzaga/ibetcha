var mongoose = require("mongoose"),
	Schema = mongoose.Schema;
	ObjectId = mongoose.Schema.ObjectId;

// Checks for model statuses
var betStatus = [
	'Not Started', //before startDate
	'Action Required', // (btw startDate and dropDate)requires action from monitors, does not count towards rating
	'Succeeded', // anytime between endDate and dropDate; contributes 5 points to rating

	'Failed',  // anytime between startDate and dropDate; contributed 1 point to rating
	'Dropped', // until startDate (not enough mentors),
			   // after dropDate (if still "Action Required")
			   //failed to get required action within time period, does not count towards rating
	
];

//Bets schema
var betSchema = new Schema({
	startDate: Date, //Date stored in UTC format
	endDate: Date,
	frequency: Number,
	description: String,
	dropDate: Date, // date after which no checkoffs are accepted anymore: 
					// bet is dropped if all action is not done by this date
					//user does not lost his money in this case

	author:{
		type: ObjectId,
		ref: 'User'
	},

	monitors:[{
		type: ObjectId,
		ref: 'User'
	}],

	status:{
		type: String,
		enum: betStatus
	},
	
	amount:{
		type:Number,
		min: 5,
		max: 100
	},

	milestones:[{
		type: ObjectId,
		ref: 'Milestone'
	}]
});

//Bindings
var Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;
