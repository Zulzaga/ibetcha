var MILLIS_IN_A_DAY = 24*60*60*1000;
var mongoose = require("mongoose"),
	Schema = mongoose.Schema;
	ObjectId = mongoose.Schema.ObjectId;
var User = require('./User');
var Milestone = require('./Milestone');
var MonitorRequest = require('./MonitorRequest');

// Checks for model statuses
var betStatus = [
	'Not Started', //before startDate
	'Action Required', // (btw startDate and dropDate)requires action from monitors, does not count towards rating
	'Succeeded', // anytime between endDate and dropDate; contributes 5 points to rating

	'Failed',  // anytime between startDate and dropDate; contributed 1 point to rating
	'Dropped', // until startDate (not enough mentors),
			   // after dropDate (if still "Action Required")
			   //failed to get required action within time period, does not count towards rating	
];

//========================== SCHEMA DEFINITION ==========================
var betSchema = new Schema({
	startDate: Date, //Date stored in UTC format
	endDate: Date,
	frequency: Number,
	description: String,
	dropDate: Date, // date after which no checkoffs are accepted anymore: 
					// bet is dropped if all action is not done by this date
					//user does not lost his money in this case

	author:{
		type: ObjectId,
		ref: 'User'
	},

	monitors:[{
		type: ObjectId,
		ref: 'User'
	}],

	status:{
		type: String,
		enum: betStatus
	},
	
	amount:{
		type:Number,
		min: 5,
		max: 100
	},

	milestones:[{
		type: ObjectId,
		ref: 'Milestone'
	}]
});



//========================== SCHEMA STATICS ==========================
betSchema.statics.create = function(data, callback){
	  var callback = callback;
	  var userId = data.userId;
	  //check if in testing mode	  
	  if (data.test){
	    milestones_JSONs = [{date: new Date()}, {date: new Date()}];
	  }

	  var endDate = new Date(data.endDate);
	  var dropDate = new Date(endDate.valueOf()+10*MILLIS_IN_A_DAY);
	 //window of 10 days after bet ends to check off

	  var status = "Not Started";
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
	      callback(true, 500, err);
	    }
	    else{
	      User.findById(userId, function (err, user) {
	            if (err){
	                callback(true, 401, 'There was an error!');
	            } else if (user === null){
	                callback(true, 500, 'No user found!');
	            } else {
	                user.bets.push(newBet._id);
	                user.save(function(err, newUser) {
	                  if (err) {
	                    callback(true, 500, 'There was an error!');
	                  } else {
	                      var monitors = data.monitors || [];
	                var betId = bet._id;
	                var monitorRequestArray = [];

	                for (i=0; i< monitors.length; i++){ //note we start at i=1
	                    var my_request = {
	                        //change date here
	                        from: userId,
	                        to: monitors[i],
	                        bet: betId
	                    };
	                    monitorRequestArray.push(my_request);
	                }

	                MonitorRequest.create(monitorRequestArray, function(err, requests) {
	                    if (err) {
	                        callback(true, 500,'There was an error');
	                    } else {
	                      console.log("Created monitor request!");
	                        var milestones_JSONs = generate_milestones(userId, bet._id, data.startDate, data.endDate, data.frequency);
	                        store_all_milestones(milestones_JSONs, newBet._id, callback);
	                    }
	                })
	                  }
	                })
	            }
	        });
	    }
	  });
}


//========================== HELPERS ==========================
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

  for (i=0; i<= num_milestones; i++){ //note we start at i=1

    current_date = new Date(start_date.valueOf() + (i*days_to_add_to_next_milestone)*MILLIS_IN_A_DAY);

    
    var my_milestone = {
      //change date here
      date: current_date,
      bet: betID,
      author: userID,
      status:  "Inactive", 
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

/*
Insert milestones into the bets
*/
var store_all_milestones = function(MilestonesArray, betId, callback){
  Bet.findOne({_id:betId}, function(err, bet){
    if (err){
      callback(true,500, err);
    }
    Milestone.create(MilestonesArray, function(err){
      if (err){
        callback(true, 500,"Cannot post milestones to database")
      }
      else{
        for (var i=1; i< arguments.length; ++i){
          bet.milestones.push(arguments[i]._id);
        }
        bet.save(function(err){
          if (err){
            callback(true, 500, "Cannot post milestones to database");
          }
          else{
           callback(false, 200, bet);
          }
        });
      }
      
    });
  });
}

//Bindings
var Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;
