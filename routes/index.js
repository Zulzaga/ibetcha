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

router.get('/auth/venmo', function(req, res, next) {
	console.log(req);
	passport.authenticate('signup', function(err, newUser, info) {
		if (err) {
            res.status(500).json({ error: "There was an error!", success: false });
        } else if (!newUser){
            res.json(info);
        } else {
            req.logIn(newUser, function(err) {
              if (err) { 
                    res.status(500).json({ error: "There was an error!", success: false });
              } else {
                    res.redirect('/');
              }
            }); 
        }
    })(req, res, next);
});

router.get('/auth/venmo/callback', function(req, res, next) {
	console.log(req);
});

// router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// router.get('/auth/facebook/callback',
//         passport.authenticate('facebook', {
//             successRedirect : '/profile',
//             failureRedirect : '/'
//         }));

module.exports = router;
