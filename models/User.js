var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;
	passwordHash = require('password-hash');

var Bet = require("./Bet");
var MoneyRecord = require("./MoneyRecord");

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
	return User.find({}, function(err, users) {
		if(err) {
			cb(true, 500, 'There was an error');
		} else {
			cb(false, 200, users);
		}
	});
}

userSchema.statics.fetchAllPayments = function(user, cb) {
	return User.findById(user._id, function(err, user){
        if (err) {
            cb(true, 500, 'There was an error');
        } else if (user === null) {
            cb(true, 401, 'No such user found!');
        } else {
            MoneyRecord.find({ 'from': user._id }).populate('from to').exec(function(err, froms) {
                if (err) {
                    cb(true, 500, 'There was an error');
                } else {
                    MoneyRecord.find({ 'to': user._id}).populate('from to').exec(function(err, tos) {
                        if (err) {
                            cb(true, 500, 'There was an error');
                        } else {
                            cb(false, 200, { 'froms': froms, 'tos': tos });
                        }
                    });
                }
            });
        }
    });
}

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

userSchema.statics.getCurrentUserInfo = function(userId, cb) {
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

userSchema.statics.findUserById = function(userId, formatUser, cb) {
	return User.findById( userId, function (err, user) {
        if (err){
            cb(true, 500, 'There was an error!');
        } else if (user === null){
            cb(true, 401, 'No such user found!');
        } else {
            cb(false, 200, formatUser(user));
        }
    });
}

var User = mongoose.model('User', userSchema);

//exporting for usage anywhere in the app
module.exports = User;