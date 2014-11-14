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


// Authenticates the user and redirects to the users login page if necessary.
function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }

    // If a user is not logged in, redirect to the login page.
    utils.sendErrResponse(res, 401, "User is not logged in!");
};

var findFriendIds = function(username1, username2, res) {
    var userId1 = null;
    var userId2 = null;

    User.findOne({username:username1}, function(error, user1) {
        if(error) {
          return false;
        } else if(user1) {
          userId1 = user1._id;
          User.findOne({username:username2}, function(error, user2) {
              if(error) {
                return false;
              } else if(user2) {
                userId2 = user2._id;
                console.log("userids", userId1, userId2);
                console.log("users", user1,'\n', user2, typeof(user1), typeof(user2));
                console.log("users and hsit", user1._id, user2._id);
                friendEachOther(userId1, userId2, res);
              }
          });
        }
    });    
};

var friendEachOther = function(userid1, userid2, res) {
    console.log("inside friendEachOther");
    User.findOne({_id:userid1}, function(error, user1) {
        if (error) {
          utils.sendErrResponse(res, 500, "Internal Error has occurred"); 
        } else if (user1 && user1.friends && user1.friends.indexOf(userid2) == -1) {
          user1.update({$push: { 'friends' : userid2}}, {upsert: true}, function(error2, model1) {
            if(error2) {
              utils.sendErrResponse(res, 500, "Internal Error has occurred"); 
            } else {
              User.findOne({_id:userid2}, function(error2, user2) {
                if(user2 && user2.friends && user2.friends.indexOf(userid1) == -1) {
                  user2.update({$push: { 'friends' : userid1}}, {upsert: true}, function(error3, model2){
                    if(error3) {
                      utils.sendErrResponse(res, 500, "Internal Error has occurred"); 
                    } else {
                      utils.sendSuccessResponse(res, {success:true}); 
                    }
                  });
                } else {
                  utils.sendErrResponse(res, 500, "You already have this friend"); 
                }
              });
            }
          });
        } else {
          utils.sendErrResponse(res, 500, "You already have this friend");
        }
    });
}; // end of the method

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


// GET /users
// Request parameters:
//     - none
// Response:
//     - success: true if all users were successfully retrieved
//     - content: TDB
//     - err: on failure, an error message
router.get('/', function(req, res) {
    User.find({}, function (err, users) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error! Could not get users.')
        } else {
            utils.sendSuccessResponse(res, users);
        }
    });
});


// GET /users/logout
// Request parameters/body: (note req.body for forms)
//     - TBD 
// Response:
//     - success: true if the user is successfully logged out
//     - content: TBD
//     - err: on failure, an error message
router.get('/logout', function(req, res) {
    console.log('inside serverside logout');
    if (req.user) {
        console.log('loggingout');
        req.logout();
        console.log("is req.user still here? " + req.user);
        utils.sendSuccessResponse(res, "Successfully logged out!.");
    } else {
        console.log("something is wrong");
        utils.sendErrResponse(res, 401, 'No user logged in.');
    }
    
    //res.redirect('/users/');
});


router.post('/signup', function(req, res, next) {
    console.log("inside signup function");
    if (req.user) {
        console.log("rebound...");
        //res.redirect('/');
        utils.sendErrResponse(res, 401, 'There was an error!');
    } 
    
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
                    utils.sendSuccessResponse(res, {success:true});
              }
            }); 
        }
    })(req, res, next);
});


router.post('/emailinvite', function(req, res) {

    var msg = {
      body: "Please go the following link to login with Venmo:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/login",
      subject: "Ibetcha Invite from Your Friend!",
      text: "You have been invited by your friend to join ibetcha.",
      receiver: req.body.friendName
    };
    console.log("req.user is this", req.user, req.body.friendName);
    emailNotifier.sendNotification(req.user, [req.body.friendEmail], res, msg);
});

router.post('/acceptfriend/:friend/by/:me', function(req, res) {
    var accepted = req.params.friend;
    var asker = req.params.me;
    console.log("accepted: ", accepted);
    console.log("asker; ", asker);
    
    findFriendIds(asker, accepted, res);
});


router.post('/askfriend', function(req, res) {
    console.log("********************");
    console.log("req.user is this crap: " + req.user);
    //req.user = {username:'butts'}; // TODO: TAKE OUT AFTER ZULSAR FIXES LOGIN
    var msg = {
      body: "Please go the following link to confirm friendship:" + "<br><br>" 
          + "http://ibetcha-mit.herokuapp.com/acceptfriend/"+req.user.username
          +"/by/"+req.body.friendName,
      subject: "Ibetcha Invite from Your Friend!",
      text: "You have been invited by your friend to join ibetcha.",
      receiver: req.body.friendName
    };
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    
    emailNotifier.sendNotification(req.user, [req.body.friendEmail], res, msg);
});

// router.post('/askfriend/:username', function(req, res) {
//     console.log('inside askfriend');
//     var msg = "Please go the following link to login with Venmo:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/login";
// })


// GET /users/login
// Request body/parameters: (note req.body for forms)
//     - TBD
// Response:
//     - success: true if the user was created (and the verification email sent)
//     - content: TBD
//     - err: on failure, an error message
// router.get('/login', passport.authenticate('venmo', {
//     scope: ['make_payments', 'access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
//     failureRedirect: '/'
//     }), function(req, res) {
// });
router.post('/login', function(req, res, next) {
    if (req.user) {
        utils.sendErrResponse(res, 401, 'User already logged in!');
    } 

    passport.authenticate('login', function(err, newUser, info){
        if (err) {
            console.log("1");
            utils.sendErrResponse(res, 500, 'There was an error!');
        } else if (!newUser){
            console.log("2");
            utils.sendErrResponse(res, 401, info);
        } else {
            req.logIn(newUser, function(err) {
                if (err) { 
                    console.log("3");
                    utils.sendErrResponse(res, 500, 'There was an error!');
                } else {
                    utils.sendSuccessResponse(res, formatUser(newUser));
                }
            }); 
        }
    })(req, res, next);
});

// GET /users/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user's profile is retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:user_id', isAuthenticated, function(req, res) {
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

// POST /users/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if a friend is added to the user with id user_id
//     - content: TBD
//     - err: on failure, an error message
router.post('/:user_id', isAuthenticated, function(req, res) {
});

/*// GET /users/friends/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user's friends successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/friends/:user_id', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});*/

router.post('/invite', isAuthenticated, function(req, res) {

});

module.exports = router;
