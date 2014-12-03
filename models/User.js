var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
	passwordHash = require('password-hash');
	passport = require('passport');

var Bet = require("./Bet");
var PaymentRequest = require("./PaymentRequest");

//========================== SCHEMA DEFINITION ==========================
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

//========================== SCHEMA STATICS ==========================

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

//find all users
userSchema.statics.fetchAllUsers = function(responseCallback, res) {
	return User.find({}, function(err, users) {
		if(err) {
			responseCallback(true, 500, 'There was an error', res);
		} else {
			responseCallback(false, 200, users, res);
		}
	});
}

//find all payments for a particular user
userSchema.statics.fetchAllPayments = function(user, responseCallback, res) {
	return User.findById(user._id, function(err, user){
        if (err) {
            responseCallback(true, 500, 'There was an error', res);
        } else if (user === null) {
            responseCallback(true, 401, 'No such user found!', res);
        } else {
        	PaymentRequest.getUserPayments(user._id, responseCallback, res);
        }
    });
}

//find all friends for a user
userSchema.statics.findAllFriends = function(username, formatFriend, responseCallback, res) {
	return User.findOne({username:username})
        .populate("friends")
        .exec(function(error, user) {
            if (error) {
            	console.log(error);
                responseCallback(true, 500, error, res);
            } else if(user) {
                responseCallback(false, 200, user.friends.map(formatFriend), res);
            }
        });
}

userSchema.statics.getUserInfo = function(userId, responseCallback, res) {
	return User.findById(userId).populate('bets monitoring').exec(function(err, user) {
		if(err) {
			responseCallback(true, 500, "There was an error", res);
		} else if (user !== null) {
			mongoose.model('Bet').getCurrentUserBets(user, userId, responseCallback, res);
		} else {
			responseCallback(true, 500, "No user logged in.", res);
		}
	});
}

// find a user by ID
userSchema.statics.findByUsername = function(username, formatUser, responseCallback, res) {
	return User.findOne({ "username": username }, function (err, user) {
        if (err){
            responseCallback(true, 500, 'There was an error!', res);
        } else if (user === null){
            responseCallback(true, 401, 'No such user found!', res);
        } else {
            responseCallback(false, 200, formatUser(user), res);
        }
    });
}

// signup a new user
userSchema.statics.signup = function(req, res, next, responseCallback) {
	if (!req.body.password || !req.body.username || !req.body.email) {
        responseCallback(true, 401, 'Missing Credentials. Username, password and/or email cannot be empty.', res);
    } else if (req.user) {
        responseCallback(true, 401, 'User already logged in!', res);
    } else {
        passport.authenticate('signup', function(err, newUser, info){
            if (err) {
                responseCallback(true, 500, 'There was an error!', res);
            } else if (!newUser){
                responseCallback(true, 500, info, res);
            } else {
                req.logIn(newUser, function(err) {
                  if (err) { 
                        responseCallback(res, 500, 'There was an error!', res);
                  } else {
                        responseCallback(false, 200, newUser, res);
                  }
                }); 
            }
        })(req, res, next);
    }
}

// login a user
userSchema.statics.login = function(req, res, next, formatUser, responseCallback) {
	if (!req.body.password || !req.body.username) {
        responseCallback(true, 401, 'Missing Credentials. Username and/or password cannot be empty.', res);
    } else if (req.user) {
        responseCallback(true, 401, 'User already logged in!', res);
    } else {
    	// authenticate the user info using passport 
        passport.authenticate('login', function(err, newUser, info){
            if (err) {
                responseCallback(true, 500, 'There was an error!', res);
            } else if (!newUser){
                responseCallback(true, 401, "Wrong username and password combination!", res);
            } else {
                req.logIn(newUser, function(err) {
                    if (err) { 
                        responseCallback(true, 500, 'There was an error!', res);
                    } else {
                        responseCallback(false, 200, formatUser(newUser), res);
                    }
                }); 
            }
        })(req, res, next);
    }
}

var User = mongoose.model('User', userSchema);

//exporting for usage anywhere in the app
module.exports = User;