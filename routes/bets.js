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
var MonitorRequest = require('../models/MonitorRequest');
var FriendRequest = require('../models/FriendRequest');
var MoneyRecord = require('../models/MoneyRecord');

//constants
var MILLIS_IN_A_DAY = 24*60*60*1000;

//======================== Authentication    =========================
/* 
Helper function that helps authenticates the user 
and if no user logged in, responds with 
appropriate message.
*/

function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }
    // If a user is not logged in, redirect to the login page.
     utils.sendErrResponse(res, 401, "User is not logged in!");
};

//========================      Helpers      =========================

/*
Check bet data before entering it to the DB
*/
  function validateBetData(data){
  var result = true;
  var startDate = (new Date(data.startDate)).valueOf();
  var endDate = (new Date(data.endDate)).valueOf();
  var result = (startDate < endDate);
  var result = ((Math.ceil((endDate-startDate)/MILLIS_IN_A_DAY)) > data.frequency);
  return result;
}


//======================== API route methods =========================

// Gets the bets of the currently logged in user.
router.get('/', isAuthenticated, function(req, res) {
    Bet.find({}).populate('author monitors milestones').exec(function(err, bets){
      	if (err){
      	   	utils.sendErrResponse(res, 500, err);
      	}
      	else{
      		  utils.sendSuccessResponse(res, bets);
      	}
    });
});

// Create a bet object after it's validated
router.post('/', function(req, res) {
  var data = req.body;
  data.userId = req.user._id;

  if (validateBetData(data)){
  		Bet.create(data, function(err, code, content){
        if (err) {
            utils.sendErrResponse(res, code, content);
        }
        else{
            utils.sendSuccessResponse(res, content);
        }
      });
  }
  else{
  		utils.sendErrResponse(res, 500, "Invalid data for Bet");
  }
});

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

//get all pending milestones
router.get('/:bet_id/milestones/pending', function(req, res) {
  console.log("inside pending milestones");
  var bet_id = req.params.bet_id;
  Milestone.findPending(bet_id, function(err, code, content){
    if (err) {
        utils.sendErrResponse(res, code, content);      
    }
    else{
        utils.sendSuccessResponse(res, content);
    }
  });
});

module.exports = router;