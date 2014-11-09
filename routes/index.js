var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')

var User = require('../model/user');
var Bet = require('../model/bet');
var Milestone = require('../model/milestone');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
