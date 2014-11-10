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


router.post('/signup', function(req, res, next) {
    if (req.user) {
        res.redirect('/');
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
                        utils.sendSuccessResponse(res, formatUser(newUser));
                  }
                }); 
            }
        })(req, res, next);
    }
});


// router.post('/invite', function(req, res) {
//     console.log(req.body);
//     console.log(req.query);
//     var friendlist = JSON.parse(req.body.friendlist);
//     console.log("friendlist: " + friendlist, typeof(friendlist));
//     var msg = "Please go the following link to login with Venmo:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/login";
//     friendlist.forEach(function(element, index, array) {
//         console.log("inside invite method: " + element);
//         emailNotifier.sendNotification(req.session.user, [element], res, msg);
//     });
// });

router.post('/emailinvite', function(req, res) {
    var msg = "Please go the following link to login with Venmo:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/login";
    console.log("req.user is this", req.user);
    emailNotifier.sendNotification(req.user, [req.body.friend], res, msg);
});

router.post('/emailfriend', function(req, res) {
    var msg = "Please go the following link to confirm friendship:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/acceptfriend/"+req.user.username;
    emailNotifier.sendNotification(req.user, [req.body.friend], res, msg);
});

// router.post('/askfriend/:username', function(req, res) {
//     console.log('inside askfriend');
//     var msg = "Please go the following link to login with Venmo:" + "<br><br>" + "http://ibetcha-mit.herokuapp.com/login";
// })

router.post('/acceptfriend', function(req, res) {
    console.log('inside makefriend');
    
})

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

// router.get('/auth/facebook', passport.authenticate('facebook'));

// router.get('/auth/facebook/callback', 
//   passport.authenticate('facebook', { successRedirect: '/',
//                                       failureRedirect: '/login' }));

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
    passport.authenticate('login', function(err, newUser, info){
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error!');
        } else if (!newUser){
            utils.sendErrResponse(res, 500, info);
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
});

// GET /users/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user's profile is retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:user_id', isAuthenticated, function(req, res) {
    User.findById( req.params.userId, function (err, user) {
        if (err){
          utils.sendErrResponse(res, 500, 'There was an error!')
        } else {
          utils.sendSuccessResponse(res, user);
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

// GET /users/logout
// Request parameters/body: (note req.body for forms)
//     - TBD 
// Response:
//     - success: true if the user is successfully logged out
//     - content: TBD
//     - err: on failure, an error message
router.get('/logout', function(req, res) {
    if (req.user) {
        req.logout();
    }
    
    res.redirect('/users/');
});


router.post('/invite', isAuthenticated, function(req, res) {

})

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

module.exports = router;
