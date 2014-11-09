var express = require('express');
var router = express.Router();

//linking collections and utils 
var utils = require('../../utils/utils')
var models = require('../../data/models');
var User = models.User,
    Bet = models.Bet,
    Milestone = models.Milestone;

// Authenticates the user and redirects to the users login page if necessary.
function isAuthenticated(req, res, next) {
    if (req.user) {
        return next();
    }

    // If a user is not logged in, redirect to the login page.
    res.json({success: false, error: "User is not logged in!"});
};

// GET /milestones (TEMP FUNCTION FOR TESTING PURPOSES)
// Request parameters/body: (note req.body for forms)
//     - none
// Response:
//     - success: true if all the milestones are successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

// GET /milestones/:bet_id
// Request parameters/body: (note req.body for forms)
//     - bet_id: a String representation of the MongoDB _id of the bet
// Response:
//     - success: true if the milestones are successfully retrieved
//     - content: TBD
//     - err: on failure, an error message
router.get('/:bet_id', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

// PUT /milestones/:milestone_id
// Request parameters/body: (note req.body for forms)
//     - milestones_id: a String representation of the MongoDB _id of the milestone
// Response:
//     - success: true if the milestone with ID milestne_id is successfully edited
//     - content: TBD
//     - err: on failure, an error message
router.put('/:milestone_id', isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;