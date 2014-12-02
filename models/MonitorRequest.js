var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var User = require('./User');

//========================== SCHEMA DEFINITION ==========================

var monitorRequestSchema = new Schema({
	from:{
		type: ObjectId,
		ref: 'User'
	},
	to:{
		type: ObjectId,
		ref: 'User'
	},
	bet:{
		type: ObjectId,
		ref: 'Bet'
	}
});

//========================== SCHEMA STATICS ==========================
// Find allt he requests of the current user
monitorRequestSchema.statics.getCurrentUserRequests = function(req, callback) {
	MonitorRequest.find({ to: req.user._id }).populate('from to bet').exec(function (err, requests) {
        if (err) {
            callback(true, 500, 'There was an error! Could not get users.')
        } else {
            callback(false, 200, requests);
        }
    });
}


// Helper function that deletes a monitor request with the given id, sent to
// currently logged in user.
monitorRequestSchema.statics.deleteRequest = function(req, requestId, callback) {
	MonitorRequest.findOneAndRemove({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
            callback(true, 500, 'There was an error! Could not find request.')
        } else if (request == null) {
            callback(true, 500, 'No such request exists!.');
        } else {
            callback(false, 200, request);
        }
    });
}

// Accept a request tomonitor a bet
monitorRequestSchema.statics.acceptRequest = function(req, callback) {
	MonitorRequest.findOne({ _id: req.params.requestId, to: req.user._id }, function (err, request) {
        if (err) {
            callback(true, 500, 'There was an error! Could not get requests.');
        } else if (request === null){
            callback(true, 500, 'No such request exists!.');
        } else {
            mongoose.model('Bet').findById(request.bet, function(err, bet) {
                if (err) {
                    callback(true, 500, 'There was an error! Could not find bet.');
                } else if (bet === null) {
                    callback(true, 500, 'Bet not found!');
                } else {
                    saveBet(bet, req, callback);
                }
            });
        }
    });
}

// Save user info.
var saveUser = function(user, bet, req, callback) {
    user.monitoring.push(bet._id);
    user.save(function(err) {
        if (err) {
            callback(true, 500, 'There was an error! Could not save the bet.');
        } else {
            MonitorRequest.deleteRequest(req, req.params.requestId, function(err, code, content){
                if (err) {
                    callback(true, 500, content);      
                } else{
                    callback(false, 200, content);
                }
            });
        }
    });
}

// Save bet info.
var saveBet = function(bet, req, callback) {
    bet.monitors.push(req.user._id);
    bet.save(function(err) {
        if (err) {
            callback(true, 500, 'There was an error! Could not save the bet.');
        } else {
            User.findById(req.user._id, function (err, user) {
                if (err) {
                    callback(true, 500, 'There was an error! Could not get requests.');
                } else {
                    saveUser(user, bet, req, callback);
                }
            });
        }
    });
}

monitorRequestSchema.statics.populateMonitorRequest = function(search, pathString, responseCallback) {
    MonitorRequest.find(search).populate(pathString).exec(function(err, requests) {
        if(err) {
            cb(true, 500, "There was an error");
        } else {
            cb(false, 200, {'user': user, 'requests': requests});
        }                         
    }); 
}

//Bindings
var MonitorRequest = mongoose.model('MonitorRequest', monitorRequestSchema);

module.exports = MonitorRequest;
