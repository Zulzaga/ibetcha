var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')
var passport = require('passport');
var utils = require('../utils/utils');
var emailNotifier = require('../utils/email');


var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');


// Authenticates the user and redirects to the users login page if necessary.
function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }

    // If a user is not logged in, redirect to the login page.
    utils.sendErrResponse(res, 401, "User is not logged in!");
};

// Deletes monitor request.
function deleteRequest(req, res, requestId) {
    MonitorRequest.findOneAndRemove({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error! Could not find request.')
        } else if (request == null){
            utils.sendErrResponse(res, 500, 'No such request exists!.');
        } else {
            utils.sendSuccessResponse(res, request);
        }
    });
}

// Gets all monitor requests current user received.
router.get('/', isAuthenticated, function(req, res) {
    MonitorRequest.find({ to: req.user._id }).populate('from to bet').exec(function (err, requests) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error! Could not get users.')
        } else {
            utils.sendSuccessResponse(res, requests);
        }
    });
});

// Creates new monitor requests.
router.post('/', isAuthenticated, function(req, res) {

    var requestTo = req.body.to;
    var betId = req.body.bet;
    MonitorRequest.create({ from: req.user._id, to: requestTo, bet: betId}, function(err, request) {
        if (err) {
            console.log("ERRRRR:", err);
            utils.sendErrResponse(res, 500, 'There was an error');
        } else {
            utils.sendSuccessResponse(res, request);
        }
    })
})

// Creates new monitor requests.
router.post('/monitors', isAuthenticated, function(req, res) {
    var monitors = JSON.parse(req.body.monitors);
    console.log("length", monitors[0]);
    var betId = req.body.bet;
    var monitorRequestArray = [];

    for (i=0; i< monitors.length; i++){ //note we start at i=1
        var my_request = {
            //change date here
            from: req.user._id,
            to: monitors[i],
            bet: betId
        };
        monitorRequestArray.push(my_request);
    }

    MonitorRequest.create(monitorRequestArray, function(err, requests) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error');
        } else {
            utils.sendSuccessResponse(res, requests);
        }
    })
})

// Accepts a monitor request.
// Adds the user to monitors list of the request bet and deletes the monitor request.
router.get('/:requestId/accept', isAuthenticated, function(req, res) {
    var requestId = req.params.requestId;
    console.log(requestId, req.user._id);
    MonitorRequest.findOne({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.');
        } else if (request === null){
            utils.sendErrResponse(res, 500, 'No such request exists!.');
        } else {
            Bet.findById(request.bet, function(err, bet) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'There was an error! Could not find bet.');
                } else if (bet === null) {
                    utils.sendErrResponse(res, 500, 'Bet not found!');
                } else {
                    bet.monitors.push(req.user._id);
                    console.log(bet.monitors);
                    bet.save(function(err) {
                        if (err) {
                            utils.sendErrResponse(res, 500, 'There was an error! Could not save the bet.');
                        } else {
                            User.findById(req.user._id, function (err, user) {
                                if (err) {
                                    utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.');
                                } else {
                                    user.monitoring.push(bet._id);
                                    user.save(function(err) {
                                        if (err) {
                                            utils.sendErrResponse(res, 500, 'There was an error! Could not save the bet.');
                                        } else {
                                            deleteRequest(req, res, requestId);
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
});

// Rejects a monitor request by deleting it.
router.get('/:requestId/reject', isAuthenticated, function(req, res) {
    var requestId = req.params.requestId;
    deleteRequest(req, res, requestId);
});

module.exports = router;
