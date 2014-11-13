var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongoose = require('mongoose');

moment().format();

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
	var startDate = (new Date(data.startDate)).valueOf();
	var endDate = (new Date(data.endDate)).valueOf();
	var result = startDate<endDate;
	return result;
}

//function that handles the logic of generating milestone JSONs
//availabe frequencies so far:
/*
1 - daily
2 - every other day
7 - weekly
14 - every two weeks
30 - monthly
*/
function generate_milestones(userID, betID, startDate, endDate, frequency){
	var milestones_array = [];
	var start_date = new Date(startDate);
	var end_date = new Date(endDate);

	// console.log("Start_date ========");
	// console.log(start_date.toString());

	// console.log("end_date ========");
	// console.log(end_date.toString());

	// number of milestones to create at intervals
	var total_num_days = ((end_date.valueOf()-start_date.valueOf())/ 86400000); // / 86400000 = millis in a day
	// console.log("total_num_days ========");
	// console.log(total_num_days);
	
	var num_milestones = Math.floor(total_num_days/frequency);
	// console.log("number of milestones to create ========");
	// console.log(num_milestones);
	
	var my_date = start_date;
	var days_to_add_to_next_milestone = frequency; 
	var add_end_date = total_num_days % frequency; // 0 if no days left over, other if some day remaining
	// console.log("add_end_date=======");
	// console.log(add_end_date);
	//set current date to start date
	var current_date = new Date(start_date.valueOf());

	for (i=1; i<= num_milestones; i++){ //note we start at i=1
		var current_date = new Date(current_date.valueOf());
		current_date.setDate(start_date.getDate() +(i*days_to_add_to_next_milestone));
		// console.log("i =====");
		// console.log(i);
		// console.log ("adding the date =====");
		// console.log(current_date.toString());
		var my_milestone = {
			//change date here
			date: current_date,
			bet: betID,
			author: userID,
			status: "Inactive", 
			monitors:[]
		};
		milestones_array.push(my_milestone);
	}
	//edge case for end date
	if ((add_end_date) !== 0){
		var my_milestone= {
			date: end_date,
			bet: betID,
			author: userID,
			status: "Inactive", 
			monitors:[]
		};
		milestones_array.push(my_milestone);
	}
	return milestones_array;
}

function makeBet(req,res){
	//adding logic stuff TBD
	var data = req.body;

	//check if in testing mode
	if (data.test){
		var userId = "545fff1a27e4ef0000dc7205"; //will remove this line, don't worry Jonathan
		milestones_JSONs = [{date: new Date()}, {date: new Date()}];
	}
	else{
		var userId = req.user._id;
	}

	var status = "Not Started"
	var betJSON = {author:userId, 
				  startDate:data.startDate, 
				  endDate:data.endDate,
				  dropDate:data.dropData,
				  frequency:data.frequency,
				  description:data.description,
				  status: status,
				  milestones:[],
				  amount: data.amount,
				  monitors:[],
				  }
	var newBet = new Bet(betJSON);
	newBet.save(function(err, bet){
		if (err){
			utils.sendErrResponse(res, 500, err);
		}
		else{
			var milestones_JSONs = generate_milestones(userId, bet._id, req.body.startDate, req.body.endDate, req.body.frequency);
			store_all_milestones(res, milestones_JSONs, newBet._id);
		}
	});

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
//	   - add_monitor: ObjectId of user who agreed to be monitor
//	   - status: String, new status
// Response:
//     - success: true if the new bet is successfully edited
//     - content: updated bet object
//     - err: on failure, an error message
router.put('/:bet_id', function(req, res) {
  var bet_id = req.params.bet_id;
  var new_status = req.body.status; //if null, assumes no status change
  var add_monitor = req.body.monitor; //if null, assumes no monitors should be added
  Bet.findOne({_id:bet_id}).populate('milestones').exec(function(err, bet){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	if (req.body.test){
  		add_monitor = mongoose.Types.ObjectId(); //some dummy id
  	}
  	if (new_status){
  		bet.status = new_status;
  	}
  	if (add_monitor){
  		//assumes for now that add_monitor is ObjectId
  		bet.monitors.push(add_monitor);
	}
  	
  	bet.save(function(err){
  		if (err){
  			utils.sendErrResponse(res, 500, err);
  		}

  		else if (add_monitor){
	  			//update milestones as well
		  		Milestone.find({bet:bet_id}, function(err, milestones){
		  			if (err){
		  		 		utils.sendErrResponse(res, 500, err);
		  		 	}
		  		 	var l = milestones.length;
		  		 	for (var i=0; i<l; i++){
		  		 		milestones[i].monitors.push(add_monitor);
		  		 		milestones[i].save(function (err){
		  		 			if (err){
		  		 				utils.sendErrResponse(res, 500, err);
		  		 			}
		  		 		});
			 		}
			 		utils.sendSuccessResponse(res, bet);
			 	});
	  		}

	  	else{
	  		utils.sendSuccessResponse(res, bet);
	  	}

  	});
  });
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
  Bet.findOne({_id:bet_id}).populate('author monitors milestones').exec(function(err, bet){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	else{
  		utils.sendSuccessResponse(res, bet);
  	}
  });
});

/* GET bet objects  */
// GET /bets/:user_id
// Request parameters/body: (note req.body for forms)
//     - user_id : a String representation of the MongoDB _id of the user
// Response:
//     - success: true if the user with ID user_id is successfully retrieved
//     - content: a list of bets (Bet objects)
//     - err: on failure, an error message
router.get('/:user_id', function(req, res) {
  var user_id = req.params.user_id;
  User.findOne({_id:user_id}).populate('bets').exec(function(err, user){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	else{
  		utils.sendSuccessResponse(res, user.bets);
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

					utils.sendSuccessResponse(res,bet);
				}
			});
		});
	});
}

function makeBet(req,res){
	//adding logic stuff TBD
	var data = req.body;

	//check if in testing mode
	if (data.test){
		var userId = "545fff1a27e4ef0000dc7205"; //will remove this line, don't worry Jonathan
		milestones_JSONs = [{date: new Date(), status: "Inactive"}, {date: new Date(),status: "Inactive"}];
	}
	else{
		var userId = req.user._id;
	}

	var status = "Not Started";
	var betJSON = {author:userId, 
				  startDate:data.startDate, 
				  endDate:data.endDate,
				  dropDate:data.dropData,
				  frequency:data.frequency,
				  description:data.description,
				  status: status,
				  milestones:[],
				  amount: data.amount,
				  monitors:[],
				  }
	var newBet = new Bet(betJSON);
	newBet.save(function(err, bet){
		if (err){
			utils.sendErrResponse(res, 500, err);
		}
		else{
			var milestones_JSONs = generate_milestones(userId, bet._id, req.body.startDate, req.body.endDate, req.body.frequency);
			store_all_milestones(res, milestones_JSONs, newBet._id);
		}
	});

}


module.exports = router;