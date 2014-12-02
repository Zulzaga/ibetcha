var express = require('express');
var router = express.Router();

// linking collections and utils
var utils = require('../utils/utils');
var passport = require('passport');
var utils = require('../utils/utils');
var emailNotifier = require('../utils/emails');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');
var isAuthenticated = utils.isAuthenticated; 

//======================== API route methods =========================

//============================GET METHODS:============================

// Gets all monitor requests current user received.
router.get('/', isAuthenticated, function(req, res) {
    MonitorRequest.getCurrentUserRequests(req, function(err, code, content){
         if (err) {
             utils.sendErrResponse(res, code, content);      
         }
         else{
             utils.sendSuccessResponse(res, content);
         }
    });
});

//============================POST METHODS:============================

// Creates a new monitor request.
// This method is for testing purpose only and not used in the actual implementation.
// In actual implementation, monitor requests are created when the bet is made inside the 
// utils makeBet function.
router.post('/', isAuthenticated, function(req, res) {

    var requestTo = req.body.to;
    var betId = req.body.bet;
    MonitorRequest.create({ from: req.user._id, to: requestTo, bet: betId}, function(err, request) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error');
        } else {
            utils.sendSuccessResponse(res, request);
        }
    })
});

// Accepts a monitor request.
// Adds the user to the monitors list of the bet of the monitor request with the given id.
// Adds the bet to the user's monitoring list and deletes the monitor request.
router.post('/:requestId/accept', isAuthenticated, function(req, res) {
    var requestId = req.params.requestId;
    MonitorRequest.acceptRequest(req, function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);      
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
    });

});

// Rejects a monitor request. Deletes the request with the given id.
router.post('/:requestId/reject', isAuthenticated, function(req, res) {
    var requestId = req.params.requestId;
    MonitorRequest.deleteRequest(req, requestId, function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);      
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
    });
});

module.exports = router;
