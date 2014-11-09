var express = require('express');
var router = express.Router();

//linking collections and utils 
var utils = require('../../utils/utils')

var User = require('../../models/user');
var Bet = require('../../models/bet');
var Milestone = require('../../models/milestone');


// GET /milestones (TEMP FUNCTION FOR TESTING PURPOSES)
// Request parameters/body: (note req.body for forms)
//     - none
// Response:
//     - success: true if all the milestones are successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/', function(req, res) {
  res.send('respond with a resource');
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
// Request parameters/body: (note req.body for forms)
//     - milestones_id: a String representation of the MongoDB _id of the milestone
// Response:
//     - success: true if the milestone with ID milestone_id is successfully edited
//     - content: TBD
//     - err: on failure, an error message
router.put('/:milestone_id', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;