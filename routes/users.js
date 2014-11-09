var express = require('express');
var router = express.Router();

//linking collections and utils
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


router.post('/signupTest', function(req, res) {
    var venmo = req.body.venmo;
    var username = req.body.username;
    var newUser = new User({venmo:venmo, username:username});
    newUser.save(function(error, newUser) {
      if(error) {
          utils.sendErrResponse(res, 500, error);
      } else {
          req.user = newUser;
          utils.sendSuccessResponse(res, newUser);
      }
    });
});


router.post('/invite', function(req, res) {
    console.log(req.body);
    var friendlist = req.body.friendlist;
    console.log("friendlist: " + friendlist);
    friendlist.forEach(function(element, index, array) {
        console.log("inside invite method: " + element);
        emailNotifier.sendNotification(req.user, element);
    });
})

// GET /users
// Request parameters:
//     - none
// Response:
//     - success: true if all users were successfully retrieved
//     - content: TDB
//     - err: on failure, an error message
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

// router.get('/auth/facebook', passport.authenticate('facebook'));

// router.get('/auth/facebook/callback', 
//   passport.authenticate('facebook', { successRedirect: '/',
//                                       failureRedirect: '/login' }));

// POST /users/login
// Request body/parameters: (note req.body for forms)
//     - TBD
// Response:
//     - success: true if the user was created (and the verification email sent)
//     - content: TBD
//     - err: on failure, an error message
router.post('/login', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

// GET /users/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user's profile is retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:user_id', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

// POST /users/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if a friend is added to the user with id user_id
//     - content: TBD
//     - err: on failure, an error message
router.post('/:user_id', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
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
router.get('/logout', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});


router.post('/invite', isAuthenticated, function(req, res) {

})


module.exports = router;
