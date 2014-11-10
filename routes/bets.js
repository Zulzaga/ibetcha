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
  var bet_id = req.params.bet_id;
  Bet.findOne({_id:bet_id}).populate('author monitors').exec(function(err, bet){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	else{
  		utils.sendSuccessResponse(res, bet);
  	}
  });
});


//Helper
function validateBetData(data){
	var result = true;
	var startDate = data.startDate;
	var endDate = data.endDate;
	var result = startDate<endDate;
	return result;
}

function makeBet(res,req){
	var data = req.body.data;
	var betJSON = {author:req.user.venmo.id, 
				  startDate:data.startDate, 
				  endDate:data.endDate,
				  dropDate:data.dropData,
				  frequency:data.frequency,
				  description:data.description,
				  status: "Action Required",
				  milestones:store_all_milestones(data.milestones),
				  amount: data.amount,
				  monitors:[],
				  }
	var newBet = new Bet(betJSON);
	newBet.save(function(err){
		if (err){
			utils.sendErrResponse(res, 500, err);
		}
		else{
			utils.sendSuccessResponse(newBet);
		}
	});

}

module.exports = router;