var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var User = require('./User');

// Monitor Request Schema
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

monitorRequestSchema.statics.getCurrentUserRequests = function(req, callback) {
    console.log("********************************GETCURRENTUSERREQUESTS*************************************");
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
        } else if (request == null){
            callback(true, 500, 'No such request exists!.');
        } else {
            callback(false, 200, request);
        }
    });
}

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
                    bet.monitors.push(req.user._id);
                    //console.log(bet.monitors);
                    bet.save(function(err) {
                        if (err) {
                            callback(true, 500, 'There was an error! Could not save the bet.');
                        } else {
                            User.findById(req.user._id, function (err, user) {
                                if (err) {
                                    callback(true, 500, 'There was an error! Could not get requests.');
                                } else {
                                    user.monitoring.push(bet._id);
                                    user.save(function(err) {
                                        if (err) {
                                            callback(true, 500, 'There was an error! Could not save the bet.');
                                        } else {
                                            MonitorRequest.deleteRequest(req, req.params.requestId, function(err, code, content){
                                                if (err) {
                                                    callback(true, 500, content);      
                                                }
                                                else{
                                                    callback(false, 200, content);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

//Bindings
var MonitorRequest = mongoose.model('MonitorRequest', monitorRequestSchema);

module.exports = MonitorRequest;
