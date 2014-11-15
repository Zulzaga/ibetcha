var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
	passwordHash = require('password-hash');

// Users Schema
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
	bets:[{ //list of bets the user created
		type: ObjectId,
		ref: 'Bet'
	}],
	friends:[{ //list of friends of the user
		type: ObjectId,
		ref: 'User',
		unique: true
	}],
	monitoring: [{
		type: ObjectId,
		ref: 'Bet'
	}]
});

userSchema.statics.create = function(username, password, email, callback) {
    password = passwordHash.generate(password);
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

var User = mongoose.model('User', userSchema);

//exporting for usage anywhere in the app (see above for usage guide)
module.exports = User;