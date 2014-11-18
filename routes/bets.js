var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongoose = require('mongoose');

moment().format();

//linking collections and utils
var utils = require('../utils/utils')
var makeBet = require('../utils/makeBet')
var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MILLIS_IN_A_DAY = 86400000;

//================== Important methods ===================

// Authenticates the user and redirects to the users login page if necessary.
function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }
    // If a user is not logged in, redirect to the login page.
     utils.sendErrResponse(res, 401, "User is not logged in!");
};



//======================== API route methods =========================


//get the bet's of the logged in user
router.get('/', isAuthenticated, function(req, res) {
  Bet.find({ }).populate('author monitors milestones').exec(function(err, bets){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	else{
  		utils.sendSuccessResponse(res, bets);
  	}
  });
});

//create a bet object after it's validated
router.post('/', function(req, res) {
		console.log("HERE0"+makeBet.validateBetData);
  if (makeBet.validateBetData(req.body)){
  		console.log("HERE1");
  		makeBet.makeBet(req, res);
  }
  else{
  			console.log("HERE2");
  		utils.sendErrResponse(res, 500, "Can't create a new Bet object");
  }
});

/*
// method for changing bet by:
//- adding a monitor (takes from req.body.monitor, it must be ObjectId)
//- changing a status: should NOT be used, for testing purposes
router.put('/:bet_id', function(req, res) {
  var bet_id = req.params.bet_id;
  var new_status = req.body.status; //if null, assumes no status change
  var add_monitor = req.body.monitor; //if null, assumes no monitors should be added
  Bet.findOne({_id:bet_id}).populate('milestones').exec(function(err, bet){
  	if (err){
  		utils.sendErrResponse(res, 500, err);
  	}
  	if (req.body.test){//if we are in the testing mode
  		add_monitor = mongoose.Types.ObjectId(); //some dummy id
  	}
  	if (new_status){ //want to change status
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

  		else if (add_monitor){ //add monitor to the bet 
	  			//update milestones as well
		  		Milestone.find({bet:bet_id}, function(err, milestones){
		  			if (err){
		  		 		utils.sendErrResponse(res, 500, err);
		  		 	}
		  		 	var l = milestones.length; //add monitors to the milestones
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

*/
//get one single bet by bet_id
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

// get all pending milestones
router.get('/:bet_id/milestones/pending', function(req, res) {
  console.log("inside pending milestones");
  var bet_id = req.params.bet_id;
  Milestone.find({bet:bet_id, $or:[{status:'Pending Action'}, {status:'Open'}]})
           .populate('author monitors')
           .sort({date:-1})
           .exec(function(error, milestones) {
              if(error) {
                utils.sendErrResponse(res, 500, error);
              } else {
                console.log("milestones: " + milestones, milestones.length);
                utils.sendSuccessResponse(res, milestones);
              }
  });
});

module.exports = router;