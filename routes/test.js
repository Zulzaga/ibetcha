var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');
var MoneyRecord = require('../models/MoneyRecord');
var FriendRequest = require('../models/FriendRequest');

// Routing for the testing page
router.get('/', function(req, res) {
	cleanCollections();

	var urlString = "http://localhost:5000/";
	if (process.env.MONGOLAB_URI) {
	     urlString = "http://mit-ibetcha.herokuapp.com/";
	}
	res.render('test.ejs', {urlString: urlString});
});

// Remove contents of all the collections in db before testing
var cleanCollections = function() {
	User.remove({}, function(err) { 
	   console.log('users removed') 
	});
	Bet.remove({}, function(err) { 
	   console.log('bets removed') 
	});
	Milestone.remove({}, function(err) { 
	   console.log('milestones removed') 
	});
	MonitorRequest.remove({}, function(err) { 
	   console.log('monitor requests removed') 
	});
	MoneyRecord.remove({}, function(err) { 
	   console.log('moneyrecords requests removed') 
	});
	FriendRequest.remove({}, function(err) { 
	   console.log('friend requests removed') 
	});
}


module.exports = router;