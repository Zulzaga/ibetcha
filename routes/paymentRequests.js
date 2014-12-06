var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

//linking collections and utils
var utils = require('../utils/utils')
var passport = require('passport');
var utils = require('../utils/utils');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');
var PaymentRequest = require('../models/PaymentRequest');
var isAuthenticated = utils.isAuthenticated;
var ajaxResponse = utils.ajaxResponse;


//======================== API route methods =========================

// Update the payment to indicate the claim that the user has paid friends
router.get('/paid/:paymentId/claim', isAuthenticated, function(req, res) {
    mongoose.model('PaymentRequest').processPaymentClaim({_id: req.params.paymentId}, 
        {$set: {requested: true}}, 
        ajaxResponse, res);
});

// Delete the payment record to indicate that the friend confirmed the claim (that the user has paid)
router.get('/received/:paymentId', isAuthenticated, function(req, res) {
    mongoose.model('PaymentRequest').confirmPaymentClaim({_id: req.params.paymentId},
        ajaxResponse, res);
});

module.exports = router;