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
	res.render('login');
});

// router.get('/auth/venmo', passport.authenticate('venmo', {
//     scope: ['make_payments', 'access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
//     failureRedirect: '/'
// }), function(req, res) {
// });


// router.get('/auth/venmo/callback', passport.authenticate('venmo', {
//     failureRedirect: '/'
// }), function(req, res) {
// 	res.send("hello" + req.user.username);
// });

module.exports = router;
