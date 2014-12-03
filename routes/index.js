var express = require('express');
var router = express.Router();
var passport = require('passport');

//linking collections and utils
var utils = require('../utils/utils');
// var passportConfig = require('./config/passport');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');

//======================== API route methods =========================

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

module.exports = router;
