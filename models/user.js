var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

// Users Schema
var userSchema = new Schema({
	//login related information:
	facebook:{
		id: Number,
		token: String,
		name: String,
		email: String
	},
	username: String,

	//Other information (independent of login):
	rating:{ //reflects the history of bets of the user
		type: Number,
		min: 1, //failed
		max: 5  //success
	},
	bets:[{ //list of bets the user created
		type: ObjectId,
		ref: 'Bet'
	}],
	friends:[{ //list of friends of the user
		type: ObjectId,
		ref: 'User'
	}]
});

var User = mongoose.model('User', userSchema);

//exporting for usage anywhere in the app (see above for usage guide)
module.exports = User;