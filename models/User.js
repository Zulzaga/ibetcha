var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
	passwordHash = require('password-hash');

var Bet = require("./Bet");

// User Schema
var userSchema = new Schema({
	//login related information:
	venmo:{
		id: Number,
		name: String
	},

	username: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String},

	//Other information (independent of login):
	rating:{ //reflects the history of bets of the user
		type: Number,
		min: 1, //failed
		max: 5  //success
	},
	bets:[{ // list of bets the user created
		type: ObjectId,
		ref: 'Bet'
	}],
	friends:[{ // list of friends of the user
		type: ObjectId,
		ref: 'User',
		unique: true
	}],
	monitoring: [{ // list of monitoring bets
		type: ObjectId,
		ref: 'Bet'
	}]
});

//Create a user JSON and save the new user
userSchema.statics.create = function(username, password, email, callback) {
    password = passwordHash.generate(password); // hash the password for storage
    var newUser = new User({
        'username': username,
        'password': password,
        'email': email,
        'bets': [],
        'friends': [],
        'rating': 3,
        'monitoring': []
    });
    newUser.save(callback);
}

userSchema.statics.fetchAllUsers = function(cb) {
	return User.find({}, cb);
}

userSchema.statics.getCurrentUserInfo = function(userId, cb) {
	var userPromise = User.findById(userId).populate('bets monitoring').exec(function(err, user) {
		if(err) {
			cb( true, 500, "There was an error");
		} else if (user !== null) {
			console.log("0");
			Bet.getCurrentUserBets(user, userId, cb);
		} else {
			cb( true, 500, "No user logged in.");
		}
	});
}

var User = mongoose.model('User', userSchema);

//exporting for usage anywhere in the app
module.exports = User;