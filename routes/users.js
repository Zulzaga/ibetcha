var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')
var models = require('../data/models');
var User = models.User,
    Bet = models.Bet,
    Milestone = models.Milestone;

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

/* POST users listing. */
router.post('/login', function(req, res) {
  res.send('respond with a resource');
});

/* GET user's profile. */
router.get('/:userID', function(req, res) {
  res.send('respond with a resource');
});

/* GET friends of user with user_id userID. */
router.get('/friends/:userID', function(req, res) {
  res.send('respond with a resource');


/* GET method: logout a user. */
router.get('/logout', function(req, res) {
  res.send('respond with a resource');
});




module.exports = router;
