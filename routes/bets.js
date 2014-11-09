var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')

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

// GET /bets
// Request parameters/body: (note req.body for forms)
//     - TBD 
// Response:
//     - success: true if the bets are successfully retrieved
//     - content: user.bets (list of in user's bets)
//     - err: on failure, an error message
router.get('/:user_id', function(req, res) {
	//return only logged in user's bets
	var user_id = req.params.user_id;

	User.findOne({_id:user_id}).populate('bets').exec(function(err, user){
		if (err){
			util.sendErrResponse(res, 500, err);
		}
		else{
			util.sendSuccessResponse(res, user.bets);
		}
	});
});

// POST /bets
// Request parameters/body: (note req.body for forms)
//     - TBD 
// Response:
//     - success: true if the new bet is successfully posted
//     - content: TBD
//     - err: on failure, an error message
router.post('/', function(req, res) {
  res.send('respond with a resource');
});

// PUT /bets/:bet_id
// Request parameters/body: (note req.body for forms)
//     - bet_id: a String representation of the MongoDB _id of the bet
// Response:
//     - success: true if the new bet is successfully edited
//     - content: TBD
//     - err: on failure, an error message
router.put('/:bet_id', function(req, res) {
  res.send('respond with a resource');
});

/* GET a bet object. */
// POST /bets
// Request parameters/body: (note req.body for forms)
//     - bet_id : a String representation of the MongoDB _id of the bet
// Response:
//     - success: true if the bet with ID bet_id is successfully retrieved
//     - content: bet (Bet object)
//     - err: on failure, an error message
router.get('/:bet_id', function(req, res) {
  var betId = req.params.bet_id;
  Bets.findOne({_id:bet_id}).populate('author monitors').exec(function(err, bet){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	else{
  		utils.sendSuccessResponse(res, bet);
  	}
  });
});

module.exports = router;