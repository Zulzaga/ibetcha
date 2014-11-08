var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../../utils/utils')
var models = require('../../data/models');
var User = models.User,
    Bet = models.Bet,
    Milestone = models.Milestone;

/* GET milestones listing. */
router.get('/:betID', function(req, res) {
  res.send('respond with a resource');
});

/* PUT method: edit a milestone listing. */
router.put('/:milestoneID', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;