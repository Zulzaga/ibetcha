//Usage Guide:
//var models = require('../data/models');
//var User = models.User,
//    Bet = models.Bet,
//    Milestone = models.Milestone;

var mongoose = require("mongoose"),
	schema = mongoose.Schema;

// Checks for model statuses
var betStatus = [
	'succeeded', // contributes 5 points to rating
	'failed', // contributed 1 point to rating
	'dropped', // failed to get required action within time period, does not count towards rating
	'Action Required' //requires action from monitors, does not count towards rating
];

var milestoneStatus = [
	'inactive', //not yet reached the date
	'Open', //awaiting checkoff
	'Closed', // got checkoff
	'Pending Action' //still requires action
];


// Users Schema
var userSchema = new Schema({
	//login related information:
	venmo:{
		clientID: String,
		clientSecret: String
	},
	username: String,

	//Other information (independent of login):
	rating:{ //reflects the history of bets of the user
		type: Number,
		min: 1, //failed
		max: 5  //success
	},
	bets:[{ //list of bets the user created
		type: Schema.Types.ObjectId,
		ref: 'Bet'
	}],
	friends:[{ //list of friends of the user
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
});


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
		type: Schema.Types.ObjectId,
		ref: 'User'
	},

	monitors:[{
		type: Schema.Types.ObjectId,
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
		type: Schema.Types.ObjectId,
		ref: 'Milestone'
	}]
});


//Milestones Schema
var milestonesSchema = new Schema({
	date:Date,
	
	author:{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
	status:{
		type: String,
		enum: milestoneStatus
	},
	monitors:[{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
});


//Bindings
var User = mongoose.model('User', userSchema),
    Bet = mongoose.model('Bet', betSchema),
    Milestone = mongoose.model('Milestone', milestoneSchema);

//exporting for usage anywhere in the app (see above for usage guide)
module.exports.User = User;
module.exports.Bet = Bet;
module.exports.Milestone = Milestone;