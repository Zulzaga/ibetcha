var express = require('express');
var router = express.Router();
var passport = require('passport');

//linking collections and utils
var utils = require('../utils/utils')

var User = require('../models/user');
var Bet = require('../models/bet');
var Milestone = require('../models/milestone');

/* GET home page. */
router.get('/', function(req, res) {
	if (req.query["venmo_challenge"]) {
		res.send(req.query["venmo_challenge"])
	}
});

// router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// router.get('/auth/facebook/callback',
//         passport.authenticate('facebook', {
//             successRedirect : '/profile',
//             failureRedirect : '/'
//         }));

module.exports = router;
