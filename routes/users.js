var express = require('express');
var router = express.Router();

// linking collections and utils
var utils = require('../utils/utils')
var emailNotifier = require('../utils/emails');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var FriendRequest = require('../models/FriendRequest');
var MonitorRequest = require('../models/MonitorRequest');
var PaymentRequest = require('../models/PaymentRequest');
var isAuthenticated = utils.isAuthenticated;

//================== Helper methods ===============================

// Helper that formats the user information for sending user info
// to the client-side.
var formatUser = function (user) {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        friends: user.friends,
        bets: user.bets,
        rating: user.rating
    };
}

// Helper that formats the friend information for sending info
// to the client-side.
var formatFriend = function(friend) {
    return {
        username: friend.username,
        _id: friend._id
    }
}

// function for ajax response calls
var ajaxResponse = function(err, code, content, res){
    if (err) {
        utils.sendErrResponse(res, code, content);
    } else{
        utils.sendSuccessResponse(res, content);
    }
};

//======================== API route methods =========================

//============================GET METHODS:============================

// Gets all users.
// For testing purposes, shows all information about the users and will be
// deleted for the final implementation.
router.get('/', function(req, res) {
    User.fetchAllUsers(ajaxResponse, res);
});

// Gets the currently logged in user information.
router.get('/current', isAuthenticated, function(req, res) {
    User.getUserInfo(req.user._id, ajaxResponse, res);
});

// Gets all the payments that the current user owes other people
router.get('/payments', isAuthenticated, function(req, res) {
    User.fetchAllPayments(req.user, ajaxResponse, res);
}); 

// Finds the friends of the given user.
router.get('/friends/:username', function(req, res) {
    User.findAllFriends(req.params.username, formatFriend, ajaxResponse, res);
});

// Logs out the user
router.get('/logout', function(req, res) {
    if (req.user) {
        req.logout();
        utils.sendSuccessResponse(res, "Successfully logged out!.");
    } else {
        utils.sendErrResponse(res, 401, 'No user logged in.');
    }
});

// Finds the user by username.
router.get('/:username', isAuthenticated, function(req, res) {
    User.findByUsername(req.params.username, formatUser, ajaxResponse, res);
});

//============================POST METHODS===========================

// Creates a new user.
router.post('/new', function(req, res, next) {
    User.signup(req, res, next, ajaxResponse);
});

// Logs in a user.
// If wrong password/username combination, responds back with an appropriate
// message.
router.post('/login', function(req, res, next) {
    User.login(req, res, next, formatUser, ajaxResponse);
});

// Sends email invites.
router.post('/emailinvite', function(req, res) {
    var msg = {
        body: "Please go the following link to signup to Ibetcha:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/#/login",
        subject: "Ibetcha Invite from Your Friend!",
        text: "You have been invited by your friend to join ibetcha.",
        receiver: req.body.friendName
    };

    emailNotifier.sendNotification(req.user, [req.body.friendEmail], res, msg);
});

module.exports = router;
