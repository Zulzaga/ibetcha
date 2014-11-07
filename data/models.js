//Usage Guide:
//var models = require('../data/models');
//var User = models.User,
//    Bet = models.Bet,
//    Milestone = models.Milestone;
//

var mongoose = require("mongoose"),
	schema = mongoose.Schema;

// Checks for model statuses

var betStatus = [
	'Ongoing', // bet open
	'Closed', //bet over
	'Pending Action' //requires action from monitors
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
	}


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
	effectiveDate:Date,
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