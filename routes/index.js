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
	res.render('index');
});

// Authenticates the user with Venmo.
// This function is not used for MVP stage. We had slight complications with Venmo,
// therefore, moved the functions here and decided to implement the interaction in the final stage.
router.get('/auth/venmo', passport.authenticate('venmo', {
    scope: ['make_payments', 'access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
    failureRedirect: '/'
}), function(req, res) {
	console.log(req.user);
});

// Authenticates the user with Venmo.
// This function is not used for MVP stage. We had slight complications with Venmo,
// therefore, moved the functions here and decided to implement the interaction in the final stage.
router.get('/auth/venmo/callback', passport.authenticate('venmo', {
    failureRedirect: '/users'
}), function(req, res) {
	console.log(req.user);
	res.redirect('/users');
});

module.exports = router;
