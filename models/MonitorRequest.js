var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

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
monitorRequestSchema.statics.getCurrentUserRequests = function(req, responseCallback, res) {
	MonitorRequest.find({ to: req.user._id }).populate('from to bet').exec(function (err, requests) {
        if (err) {
            responseCallback(true, 500, 'There was an error! Could not get users.', res)
        } else {
            responseCallback(false, 200, requests, res);
        }
    });
}


// Helper function that deletes a monitor request with the given id, sent to
// currently logged in user.
monitorRequestSchema.statics.deleteRequest = function(req, requestId, responseCallback, res) {
	MonitorRequest.findOneAndRemove({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
            responseCallback(true, 500, 'There was an error! Could not find request.', res)
        } else if (request == null) {
            responseCallback(true, 500, 'No such request exists!.', res);
        } else {
            responseCallback(false, 200, request, res);
        }
    });
}

// Accept a request tomonitor a bet
monitorRequestSchema.statics.acceptRequest = function(req, responseCallback, res) {
	MonitorRequest.findOne({ _id: req.params.requestId, to: req.user._id }, function (err, request) {
        if (err) {
            responseCallback(true, 500, 'There was an error! Could not get requests.', res);
        } else if (request === null){
            responseCallback(true, 500, 'No such request exists!.', res);
        } else {
            mongoose.model('Bet').findById(request.bet, function(err, bet) {
                if (err) {
                    responseCallback(true, 500, 'There was an error! Could not find bet.', res);
                } else if (bet === null) {
                    responseCallback(true, 500, 'Bet not found!', res);
                } else {
                    saveBet(bet, req, responseCallback, res);
                }
            });
        }
    });
}

monitorRequestSchema.statics.populateMonitorRequest = function(search, pathString, user, responseCallback, res) {
    MonitorRequest.find(search).populate(pathString).exec(function(err, requests) {
        if(err) {
            responseCallback(true, 500, "There was an error", res);
        } else {
            responseCallback(false, 200, {'user': user, 'requests': requests}, res);
        }                         
    }); 
}

// Save bet info.
var saveBet = function(bet, req, responseCallback, res) {
    bet.monitors.push(req.user._id);
    bet.save(function(err) {
        if (err) {
            responseCallback(true, 500, 'There was an error! Could not save the bet.', res);
        } else {
            mongoose.model('User').findById(req.user._id, function (err, user) {
                if (err) {
                    responseCallback(true, 500, 'There was an error! Could not get requests.', res);
                } else {
                    saveUser(user, bet, req, responseCallback, res);
                }
            });
        }
    });
}

// Save user info.
var saveUser = function(user, bet, req, responseCallback, res) {
    user.monitoring.push(bet._id);
    user.save(function(err) {
        if (err) {
            responseCallback(true, 500, 'There was an error! Could not save the bet.', res);
        } else {
            MonitorRequest.deleteRequest(req, req.params.requestId, function(err, code, content){
                if (err) {
                    responseCallback(true, 500, content, res);      
                } else{
                    responseCallback(false, 200, content, res);
                }
            });
        }
    });
}

//Bindings
var MonitorRequest = mongoose.model('MonitorRequest', monitorRequestSchema);

module.exports = MonitorRequest;
