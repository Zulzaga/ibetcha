var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')
var models = require('../data/models');
var User = models.User,
    Bet = models.Bet,
    Milestone = models.Milestone;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
