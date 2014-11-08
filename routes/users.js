var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')
var models = require('../data/models');
var User = models.User,
    Bet = models.Bet,
    Milestone = models.Milestone;

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

// POST /users/login
// Request body/parameters: (note req.body for forms)
//     - TBD
// Response:
//     - success: true if the user was created (and the verification email sent)
//     - content: TBD
//     - err: on failure, an error message
router.post('/login', function(req, res) {
  res.send('respond with a resource');
});

// GET /users/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user's profile is retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:user_id', function(req, res) {
  res.send('respond with a resource');
});

// GET /users/friends/:user_id
// Request parameters:
//     - user_id: a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user's friends successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/friends/:user_id', function(req, res) {
  res.send('respond with a resource');
});

// GET /users/logout
// Request parameters/body: (note req.body for forms)
//     - TBD 
// Response:
//     - success: true if the user is successfully logged out
//     - content: TBD
//     - err: on failure, an error message
router.get('/logout', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
