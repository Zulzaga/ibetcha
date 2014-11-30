var express = require('express');
var router = express.Router();

// linking collections and utils
var utils = require('../utils/utils')
var passport = require('passport');
var utils = require('../utils/utils');
var emailNotifier = require('../utils/email');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var FriendRequest = require('../models/FriendRequest');
var MonitorRequest = require('../models/MonitorRequest');
var MoneyRecord = require('../models/MoneyRecord');
var isAuthenticated = utils.isAuthenticated;

//================== Important methods ===============================


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
// NOT USED RIGHT NOW
var ajaxResponse = function(err, code, content, res){
    if (err) {
        utils.sendErrResponse(res, code, content);
    }
    else{
        utils.sendSuccessResponse(res, content);
    }
};

//======================== API route methods =========================

//============================GET METHODS:============================

// Gets all users.
// For testing purposes, shows all information about the users and will be
// deleted for the final implementation.
router.get('/', function(req, res) {
    console.log("****************1**********************");
    User.fetchAllUsers(function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);      
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
    });
});

// Gets the currently logged in user information.
router.get('/current', isAuthenticated, function(req, res) {
    console.log("inside users/current");
    console.log("***************2***********************");
    User.getCurrentUserInfo(req.user._id, function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);      
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
    });
});

// Gets all the payments that the current user owes other people
router.get('/payments', isAuthenticated, function(req, res) {
    console.log("****************3**********************");
    User.fetchAllPayments(user, function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);      
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
    });
    // User.findById(req.user._id, function(err, user){
    //     if (err) {
    //         utils.sendErrResponse(res, 500, 'There was an error');
    //     } else if (user === null) {
    //         utils.sendErrResponse(res, 401, 'No such user found!');
    //     } else {
    //         MoneyRecord.find({ 'from': req.user._id }).populate('from to').exec(function(err, froms) {
    //             if (err) {
    //                 utils.sendErrResponse(res, 500, 'There was an error');
    //             } else {
    //                 MoneyRecord.find({ 'to': req.user._id}).populate('from to').exec(function(err, tos) {
    //                     if (err) {
    //                         utils.sendErrResponse(res, 500, 'There was an error');
    //                     } else {
    //                         utils.sendSuccessResponse(res, { 'froms': froms, 'tos': tos });
    //                     }
    //                 });
    //             }
    //         });
    //     }
    // });
}); 

// Finds the friends of the given user.
router.get('/friends/:username', function(req, res) {
    console.log("inside get friends");
    console.log("****************4**********************");
    // User.findAllFriends(req.params.username, formatFriend, function(err, code, content){
    //     if (err) {
    //         utils.sendErrResponse(res, code, content);      
    //     }
    //     else{
    //         utils.sendSuccessResponse(res, content);
    //     }
    // });

    User.findOne({username:req.params.username})
        .populate("friends")
        .exec(function(error, user) {
            if(error) {
                utils.sendErrResponse(res, 500, error);
            } else if(user) {
                utils.sendSuccessResponse( res, user.friends.map(formatFriend));
            }
        });
});

// Logs out the user
router.get('/logout', function(req, res) {
    console.log('inside serverside logout');
    console.log("*****************5*********************");
    if (req.user) {
        req.logout();
        utils.sendSuccessResponse(res, "Successfully logged out!.");
    } else {
        utils.sendErrResponse(res, 401, 'No user logged in.');
    }
});

// Finds the user by the id.
router.get('/:user_id', isAuthenticated, function(req, res) {
    console.log("****************6**********************");
    // User.findUserById(req.params.user_id, formatUser, function(err, code, content){
    //     if (err) {
    //         utils.sendErrResponse(res, code, content);      
    //     }
    //     else{
    //         utils.sendSuccessResponse(res, content);
    //     }
    // });
    
    User.findById( req.params.user_id, function (err, user) {
        if (err){
            utils.sendErrResponse(res, 500, 'There was an error!');
        } else if (user === null){
            utils.sendErrResponse(res, 401, 'No such user found!');
        } else {
            utils.sendSuccessResponse(res, formatUser(user));
        }
    });
});

//============================POST METHODS===========================

// Creates a new user.
router.post('/new', function(req, res, next) {
    console.log("******************7********************");
    console.log("inside signup function");
    if (req.user) {
        //res.redirect('/');
        utils.sendErrResponse(res, 401, 'There was an error!');
    } else {
        passport.authenticate('signup', function(err, newUser, info){
            if (err) {
                utils.sendErrResponse(res, 500, 'There was an error!');
            } else if (!newUser){
                utils.sendErrResponse(res, 500, info);
            } else {

                req.logIn(newUser, function(err) {
                  if (err) { 
                        utils.sendErrResponse(res, 500, 'There was an error!');
                  } else {
                        utils.sendSuccessResponse(res, newUser);
                  }
                }); 
            }
        })(req, res, next);
    }
});

// Logs in a user.
// If wrong password/username combination, responds back with an appropriate
// message.
router.post('/login', function(req, res, next) {
    console.log("******************8********************");
    if (req.user) {
        utils.sendErrResponse(res, 401, 'User already logged in!');
    } else {
        passport.authenticate('login', function(err, newUser, info){
            if (err) {
                utils.sendErrResponse(res, 500, 'There was an error!');
            } else if (!newUser){
                utils.sendErrResponse(res, 401, info);
            } else {
                req.logIn(newUser, function(err) {
                    if (err) { 
                        utils.sendErrResponse(res, 500, 'There was an error!');
                    } else {
                        utils.sendSuccessResponse(res, formatUser(newUser));
                    }
                }); 
            }
        })(req, res, next);
    }
});

// Sends email invites.
router.post('/emailinvite', function(req, res) {
    var msg = {
      body: "Please go the following link to signup to Ibetcha:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/#/login",
      subject: "Ibetcha Invite from Your Friend!",
      text: "You have been invited by your friend to join ibetcha.",
      receiver: req.body.friendName
    };
    console.log("req.user is this", req.user, req.body.friendName);
    emailNotifier.sendNotification(req.user, [req.body.friendEmail], res, msg);
});

module.exports = router;
