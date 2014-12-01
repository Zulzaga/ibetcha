var express = require('express');
var router = express.Router();

//linking collections and utils
var utils = require('../utils/utils')
var passport = require('passport');
var utils = require('../utils/utils');
var emailNotifier = require('../utils/email');

var User = require('../models/User');
var Bet = require('../models/Bet');
var Milestone = require('../models/Milestone');
var MonitorRequest = require('../models/MonitorRequest');
var MoneyRecord = require('../models/MoneyRecord');
var isAuthenticated = utils.isAuthenticated;


// Update the payment to indicate the claim that the user has paid friends
router.get('/paid/:paymentId/claim', isAuthenticated, function(req, res) {
    console.log("inside serverside paid claim");

    MoneyRecord.processPaymentClaim({_id: req.params.paymentId}, 
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
    console.log('inside serverside received');
    MoneyRecord.confirmPaymentClaim({_id: req.params.paymentId},
                                    function(err, code, content){
                                        if (err) {
                                            utils.sendErrResponse(res, code, content);      
                                        }
                                        else{
                                            utils.sendSuccessResponse(res, content);
                                        }
                                    });
    // MoneyRecord.findOneAndRemove({_id: req.params.paymentId}, 
    //                                function(err, code, content){
    //                                     if (err) {
    //                                         utils.sendErrResponse(res, code, content);      
    //                                     }
    //                                     else{
    //                                         utils.sendSuccessResponse(res, content);
    //                                     }
    //                                 });
});

// // Gets all monitor requests current user received.
// router.get('/', isAuthenticated, function(req, res) {
//     MoneyRecord.find({ to: req.user._id }).populate('from to').exec(function (err, requests) {
//         if (err) {
//             utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.')
//         } else {
//             utils.sendSuccessResponse(res, requests);
//         }
//     });
// });


module.exports = router;