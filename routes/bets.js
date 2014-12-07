var express = require('express');
var router = express.Router();
var moment = require('moment');
var mongoose = require('mongoose');
moment().format();

//linking collections and utils
var utils = require('../utils/utils')
var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');
var FriendRequest = require('../models/FriendRequest');
var PaymentRequest = require('../models/PaymentRequest');
var isAuthenticated = utils.isAuthenticated;
var ajaxResponse = utils.ajaxResponse;

//constants
var MILLIS_IN_A_DAY = 24*60*60*1000;


//======================== API route methods =========================

// Gets the bets of the currently logged in user.
router.get('/', isAuthenticated, function(req, res) {
    Bet.find({}).populate('author monitors milestones').exec(function(err, bets){
        ajaxResponse(err, 500, bets, res);
    });
});

// Create a bet object after it's validated
router.post('/', function(req, res) {
    var data = req.body;
    data.userId = req.user._id;
    Bet.create(data, ajaxResponse, res);
});

//get one single bet by bet_id
router.get('/:bet_id', function(req, res) {
    var bet_id = req.params.bet_id;
    Bet.findOne({ _id: bet_id }).populate('author monitors milestones').exec(function(err, bet){
        ajaxResponse(err, 500, bet, res);
    });
});

// get all pending milestones
router.get('/:bet_id/milestones/pending', function(req, res) {
    var bet_id = req.params.bet_id;
    Milestone.findPending(bet_id, ajaxResponse, res);
});

module.exports = router;