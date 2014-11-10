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

//Helper
function validateBetData(data){
	var result = true;
	var startDate = data.startDate;
	var endDate = data.endDate;
	var result = startDate<endDate;
	return result;
}

//function that handles the logic of generating milestone JSONs
function generate_milestones(startDate, endDate, frequency){
	return [];
}

//test function to give out test data
function give_test_data(){
	var testData = {
		startDate:10000, 
		endDate:1000000, 
		frequency: 2, 
		amount: 30,
		author:"545fff1a27e4ef0000dc7205",
		milestones:[{date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"},
				   {date:100000, author: "545fff1a27e4ef0000dc7205"}]
	};
	return testData;
}

// POST /bets
// Request parameters/body: (note req.body for forms)
//     - Bet json object is in req.body
// Response:
//     - success: true if the new bet is successfully posted
//     - content: new bet object
//     - err: on failure, an error message
router.post('/', function(req, res) {
  //if (validateBetData(req.body)){
  	makeBet(req, res);
  //}
  //else{
  	//utils.sendErrResponse(res, 500, "Can't create a new Bet object");

  //}
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

var store_all_milestones = function(res, MilestonesArray, betId){
	Bet.findOne({_id:betId}, function(err, bet){
		if (err){
			utils.sendErrResponse(res, 500, err);
		}
		Milestone.create(MilestonesArray, function(err){

			if (err){
				utils.sendErrResponse(res,500, "Cannot post milestones to database")
			}
			else{

				for (var i=1; i< arguments.length; ++i){
					bet.milestones.push(arguments[i]._id);
				}
			}
			bet.save(function(err){
				if (err){
					utils.sendErrResponse(res,500, "Cannot post milestones to database");
				}
				else{
					utils.sendSuccessResponse(res,"created Bet");
				}
			});
		});
	});
}

function makeBet(req,res){
	//adding logic stuff TBD
	var milestones_JSONs = generate_milestones(req.body.startDate, req.body.endDate, req.body.frequency);
	var data = req.body.data;
	var userId = req.user._id;

	//var data = testData;
	//var userId = testUser;
	
	var betJSON = {author:userId, 
				  startDate:data.startDate, 
				  endDate:data.endDate,
				  dropDate:data.dropData,
				  frequency:data.frequency,
				  description:data.description,
				  status: "Action Required",
				  milestones:[],
				  amount: data.amount,
				  monitors:[],
				  }
	var newBet = new Bet(betJSON);
	newBet.save(function(err){
		if (err){
			utils.sendErrResponse(res, 500, err);
		}
		else{
			store_all_milestones(res, milestones_JSONs, newBet._id);
		}
	});

}

module.exports = router;