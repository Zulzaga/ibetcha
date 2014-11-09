var express = require('express');
var router = express.Router();

//linking collections and utils 
var utils = require('../../utils/utils')

var User = require('../../models/User');
var Bet = require('../../models/Bet');
var Milestone = require('../../models/Milestone');


// GET /milestones (TEMP FUNCTION FOR TESTING PURPOSES)
// Request parameters/body:
//     - none
// Response:
//     - success: true if all the milestones are successfully retrieved
//     - content: all milestone objects returned as a JSON
//     - err: on failure, an error message
router.get('/', function(req, res) {

	Milestone.find({}, function(err, doc){
		if (err){
			utils.sendErrResponse(res,500, "Cannot retrieve Milestones");
		}else{
			utils.sendSuccessResponse(res,doc);
		}
	});
});

/*// GET /milestones/:bet_id   //NOTE: duplication
// Request parameters/body: (note req.body for forms)
//     - bet_id: a String representation of the MongoDB _id of the bet
// Response:
//     - success: true if the milestones are successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:bet_id', function(req, res) {
  res.send('respond with a resource');
});*/

// PUT /milestones/:milestone_id
// Request parameters:
//     - milestones_id: a String representation of the MongoDB _id of the milestone
// Response:
//     - success: true if the status of the milestone with ID milestone_id is successfully edited
//				  possible statuses include: Inactive, Open, Closed, Pending Action
//     - content: the milestone object with ID milestone_id
//     - err: on failure, an error message
router.put('/:milestone_id', function(req, res) {
	var milestone_id = req.params.milestone_id;
	var new_status = req.body.status;
	Milestone.findById(milestone_id, function(err, doc){
		if (err){
			utils.sendErrResponse(res,500, "Cannot retrieve Milestone with provided ID");
		}else{
			doc.status = new_status;
			doc.save(function(err){
				if (err){
					utils.sendErrResponse(res,500, "Cannot retrieve Milestone with provided ID");
				}
				utils.sendSuccessResponse(res,doc);
			});
		}
	})
});

module.exports = router;