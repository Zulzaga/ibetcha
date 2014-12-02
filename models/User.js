var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
	passwordHash = require('password-hash');
	passport = require('passport');

var Bet = require("./Bet");
var MoneyRecord = require("./MoneyRecord");

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
userSchema.statics.fetchAllUsers = function(cb) {
	return User.find({}, function(err, users) {
		if(err) {
			cb(true, 500, 'There was an error');
		} else {
			cb(false, 200, users);
		}
	});
}

//find all payments for a particular user
userSchema.statics.fetchAllPayments = function(user, cb) {
	return User.findById(user._id, function(err, user){
        if (err) {
            cb(true, 500, 'There was an error');
        } else if (user === null) {
            cb(true, 401, 'No such user found!');
        } else {
        	MoneyRecord.getUserPayments(user._id, cb);
        }
    });
}

//find all friends for a user
userSchema.statics.findAllFriends = function(username, formatFriend, cb) {
	return User.findOne({username:username})
        .populate("friends")
        .exec(function(error, user) {
            if(error) {
            	console.log(error);
                cb(true, 500, error);
            } else if(user) {
                cb(false, 200, user.friends.map(formatFriend));
            }
        });
}

userSchema.statics.getUserInfo = function(userId, cb) {
	return User.findById(userId).populate('bets monitoring').exec(function(err, user) {
		if(err) {
			cb( true, 500, "There was an error");
		} else if (user !== null) {
			mongoose.model('Bet').getCurrentUserBets(user, userId, cb);
		} else {
			cb( true, 500, "No user logged in.");
		}
	});
}

// find a user by ID
userSchema.statics.findByUsername = function(username, formatUser, cb) {
	return User.findOne({ "username": username }, function (err, user) {
        if (err){
            cb(true, 500, 'There was an error!');
        } else if (user === null){
            cb(true, 401, 'No such user found!');
        } else {
            cb(false, 200, formatUser(user));
        }
    });
}

// signup a new user
userSchema.statics.signup = function(req, res, next, cb) {
	if (!req.body.password || !req.body.username || !req.body.email) {
        cb(true, 401, 'Missing Credentials. Username, password and/or email cannot be empty.');
    } else if (req.user) {
        cb(true, 401, 'User already logged in!');
    } else {
        passport.authenticate('signup', function(err, newUser, info){
            if (err) {
                cb(true, 500, 'There was an error!');
            } else if (!newUser){
                cb(true, 500, info);
            } else {
                req.logIn(newUser, function(err) {
                  if (err) { 
                        cb(res, 500, 'There was an error!');
                  } else {
                        cb(false, 200, newUser);
                  }
                }); 
            }
        })(req, res, next);
    }
}

// login a user
userSchema.statics.login = function(req, res, next, cb) {
	if (!req.body.password || !req.body.username) {
        cb(true, 401, 'Missing Credentials. Username and/or password cannot be empty.');
    } else if (req.user) {
        cb(true, 401, 'User already logged in!');
    } else {
    	// authenticate the user info using passport 
        passport.authenticate('login', function(err, newUser, info){
            if (err) {
                cb(true, 500, 'There was an error!');
            } else if (!newUser){
                cb(true, 401, "Wrong username and password combination!");
            } else {
                req.logIn(newUser, function(err) {
                    if (err) { 
                        cb(true, 500, 'There was an error!');
                    } else {
                        cb(false, 200, newUser);
                    }
                }); 
            }
        })(req, res, next);
    }
}

var User = mongoose.model('User', userSchema);

//exporting for usage anywhere in the app
module.exports = User;