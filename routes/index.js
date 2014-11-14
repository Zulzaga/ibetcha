var express = require('express');
var router = express.Router();
var passport = require('passport');

//linking collections and utils
var utils = require('../utils/utils');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');

/* GET home page. */
router.get('/', function(req, res) {
	if (req.query["venmo_challenge"]) {
		res.send(req.query["venmo_challenge"])
	}
	else{
		res.render('login');
	}
});

router.get('/auth/venmo', passport.authenticate('venmo', {
    scope: ['make_payments', 'access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
    failureRedirect: '/'
}), function(req, res) {
	console.log(req.user);
});

router.get('/auth/venmo/callback', passport.authenticate('venmo', {
    failureRedirect: '/users'
}), function(req, res) {
	console.log(req.user);
	res.redirect('/users');
});

module.exports = router;
