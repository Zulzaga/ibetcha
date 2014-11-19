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
var MILLIS_IN_A_DAY = 86400000;

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

/*
Handle the logic of generating milestone JSONs
*/
function generate_milestones(userID, betID, startDate, endDate, frequency){
  var milestones_array = [];
  var start_date = new Date(startDate);
  var end_date = new Date(endDate);

  // number of milestones to create at intervals
  var total_num_days = ((end_date.valueOf()-start_date.valueOf())/ MILLIS_IN_A_DAY);
  
  var num_milestones = Math.floor(total_num_days/frequency);
  
  var my_date = start_date;
  var days_to_add_to_next_milestone = frequency; 
  var add_end_date = total_num_days % frequency; // 0 if no days left over, other if some day remaining

  var current_date = new Date(start_date.valueOf());

  for (i=1; i<= num_milestones; i++){ //note we start at i=1
    var current_date = new Date(current_date.valueOf());
    current_date.setDate(start_date.getDate() +(i*days_to_add_to_next_milestone));
    
    var my_milestone = {
      //change date here
      date: current_date,
      bet: betID,
      author: userID,
      status: "Pending Action",//"Inactive", 
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
      status: "Pending Action",//"Inactive", 
      monitors:[]
    };
    milestones_array.push(my_milestone);
  }
  return milestones_array;
}

/*
Insert milestones into the bets
*/
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
        bet.save(function(err){
          if (err){
            utils.sendErrResponse(res,500, "Cannot post milestones to database");
          }
          else{
            utils.sendSuccessResponse(res,bet);
          }
        });
      }
      
    });
  });
}

/* 
Create bet object
*/
function makeBet(req,res){
  var data = req.body;
  console.log("body", req.body);

  //check if in testing mode
  if (data.test){
    var userId = req.user._id; //will remove this line, don't worry Jonathan
    milestones_JSONs = [{date: new Date()}, {date: new Date()}];
  }
  else{
    var userId = req.user._id;
  }

  var dropDate = (new Date(data.endDate));
  dropDate.setDate(dropDate.getDate()+10); //window of 10 days after bet ends to check off

  var status = "Not Started"
  var betJSON = {author:userId, 
          startDate:data.startDate, 
          endDate:data.endDate,
          dropDate:dropDate,
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
      User.findById( req.user._id, function (err, user) {
            if (err){
                utils.sendErrResponse(res, 500, 'There was an error!');
            } else if (user === null){
                utils.sendErrResponse(res, 401, 'No user found!');
            } else {
                user.bets.push(newBet._id);
                user.save(function(err, newUser) {
                  if (err) {
                    utils.sendErrResponse(res, 500, 'There was an error!');
                  } else {
                      var monitors = data.monitors || [];
                var betId = bet._id;
                var monitorRequestArray = [];

                for (i=0; i< monitors.length; i++){ //note we start at i=1
                    var my_request = {
                        //change date here
                        from: req.user._id,
                        to: monitors[i],
                        bet: betId
                    };
                    monitorRequestArray.push(my_request);
                }

                MonitorRequest.create(monitorRequestArray, function(err, requests) {
                    if (err) {
                        utils.sendErrResponse(res, 500, 'There was an error');
                    } else {
                      console.log("Created monitor request!");
                        var milestones_JSONs = generate_milestones(userId, bet._id, req.body.startDate, req.body.endDate, req.body.frequency);
                        store_all_milestones(res, milestones_JSONs, newBet._id);
                    }
                })
                  }
                })
            }
        });
    }
  });

}
//======================== API route methods =========================

// Gets the bets of the currently logged in user.
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

// Create a bet object after it's validated
router.post('/', function(req, res) {
  if (validateBetData(req.body)){
  		makeBet(req, res);
  }
  else{
  		utils.sendErrResponse(res, 500, "Can't create a new Bet object");
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
  Milestone.find({bet:bet_id, $or:[{status:'Pending Action'}, {status:'Open'}]})
           .populate('author monitors')
           .sort({date:-1})
           .exec(function(error, milestones) {
              if(error) {
                utils.sendErrResponse(res, 500, error);
              } else {
                console.log("milestones: " + milestones, milestones.length, bet_id);
                utils.sendSuccessResponse(res, milestones);
              }
  });
});

module.exports = router;