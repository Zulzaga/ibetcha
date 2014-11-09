var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')

var User = require('../models/user');
var Bet = require('../models/bet');
var Milestone = require('../models/milestone');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
