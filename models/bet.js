var mongoose = require("mongoose"),
	Schema = mongoose.Schema;
	ObjectId = mongoose.Schema.Types.ObjectId;

// Checks for model statuses
var betStatus = [
	'succeeded', // contributes 5 points to rating
	'failed', // contributed 1 point to rating
	'dropped', // failed to get required action within time period, does not count towards rating
	'Action Required' //requires action from monitors, does not count towards rating
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
var Bet = mongoose.model('Bet', betSchema)

module.exports = Bet;
