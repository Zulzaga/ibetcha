var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");

//linking collections and utils
var utils = require('../utils/utils')
var passport = require('passport');
var utils = require('../utils/utils');
var emailNotifier = require('../utils/emails');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');
var MoneyRecord = require('../models/MoneyRecord');
var isAuthenticated = utils.isAuthenticated;

//======================== API route methods =========================

// Update the payment to indicate the claim that the user has paid friends
router.get('/paid/:paymentId/claim', isAuthenticated, function(req, res) {
    mongoose.model('MoneyRecord').processPaymentClaim({_id: req.params.paymentId}, 
        {$set: {requested: true}},
        function(err, code, content){
            if (err) {
                utils.sendErrResponse(res, code, content);      
            }
            else{
                utils.sendSuccessResponse(res, content);
            }
    });
});

// Delete the payment record to indicate that the friend confirmed the claim (that the user has paid)
router.get('/received/:paymentId', isAuthenticated, function(req, res) {
    mongoose.model('MoneyRecord').confirmPaymentClaim({_id: req.params.paymentId},
        function(err, code, content){
            if (err) {
                utils.sendErrResponse(res, code, content);      
            }
            else{
                utils.sendSuccessResponse(res, content);
            }
    });
});

module.exports = router;