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
var FriendRequest = require('../models/FriendRequest');
var isAuthenticated = utils.isAuthenticated;


//================== Important methods ===================


// Given two user ObjectIds, put them in each other's friend array
// var friendEachOther = function(userid1, userid2, callback, responseCallback) {
//     console.log("inside friendEachOther");
//     // return User.friendEachOther(userid1, userid2, callback, responseCallback);

//     // User.findById( userid1, function(error, user1) {
//     //     if (error) {
//     //         utils.sendErrResponse(res, 500, "Internal Error has occurred"); 
//     //     } else {
//     //       user1.update({$push: { 'friends' : userid2}}, {upsert: true}, function(error2, model1) {
//     //         if(error2) {
//     //           utils.sendErrResponse(res, 500, "Internal Error has occurred"); 
//     //         } else {
//     //           User.findById( userid2, function(error2, user2) {
//     //               user2.update({$push: { 'friends' : userid1}}, {upsert: true}, function(error3, model2){
//     //                 if(error3) {
//     //                   utils.sendErrResponse(res, 500, "Internal Error has occurred"); 
//     //                 } else {
//     //                   callback;
//     //                 }
//     //               });
//     //           });
//     //         }
//     //       });
//     //     } 
//     // });
// };

// // Sends a friend request from logged in user to the user with the given id.
// function sendFriendRequest(to, req, res) {
//     // FriendRequest.findOne({ 'to': to._id, 'from': req.user._id }, function (err1, request1) {
//     //     if (err1) {
//     //         utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.');
//     //     } else if (request1 === null) {
//     //         FriendRequest.findOne({ 'from': to._id, 'to': req.user._id }, function (err1, request2) {
//     //             if (err1) {
//     //                 utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.');
//     //             } else if (request2 == null) {
//     //                 if (to.friends && to.friends.indexOf(req.user._id) == -1) {
//     //                     FriendRequest.create(req.user._id, to._id, function(err2, request3) {
//     //                         if (err2) {
//     //                             utils.sendErrResponse(res, 500, 'There was an error');
//     //                         } else {
//     //                             console.log("created friend request!");
//     //                             utils.sendSuccessResponse(res, request3);
//     //                         }
//     //                     })
//     //                 } else {
//     //                     utils.sendErrResponse(res, 500, "You already have this friend.");
//     //                 }
//     //             } else {
//     //                 utils.sendErrResponse(res, 500, 'The user already sent a friend request to you. Go to your Home Page and click on Friends/FriendRequests page to accept.');
//     //             }
//     //         });
//     //     } else {
//     //         utils.sendErrResponse(res, 500, 'Already sent a friend request. Cannot send a request again. Wait for your friend to accept!');
//     //     }
//     // });
// }

// // Deletes a monitor request with the given id.
// function deleteRequest(req, res, requestId) {
//     // FriendRequest.findOneAndRemove({ _id: requestId, to: req.user._id }, function (err, request) {
//     //     if (err) {
//     //         utils.sendErrResponse(res, 500, 'There was an error! Could not find request.')
//     //     } else if (request == null){
//     //         utils.sendErrResponse(res, 500, 'No such request exists!.');
//     //     } else {
//     //         utils.sendSuccessResponse(res, request);
//     //     }
//     // });
// }

//======================== API route methods =========================

//============================GET METHODS:============================

// Gets all monitor requests current user received.
router.get('/', isAuthenticated, function(req, res) {
    FriendRequest.find({ to: req.user._id }).populate('from to').exec(function (err, requests) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.')
        } else {
            utils.sendSuccessResponse(res, requests);
        }
    });
});

//============================POST METHODS:============================

// Creates a new friend request from the logged in user to the user with given
// email.
router.post('/byEmail', isAuthenticated, function(req, res) {
    var requestTo = req.body.to;
    console.log("moooomooo",requestTo);
    if (requestTo === req.user.email) {
        utils.sendErrResponse(res, 500, 'Cannot send a friend request to yourself!.');
    } else {
        User.findOne({ email: requestTo }, function(err1, requestReceiver) {
            if (err1) {
                utils.sendErrResponse(res, 500, 'There was an error!');
            } else if (requestReceiver === null) {
                utils.sendErrResponse(res, 500, 'No such user found!');
            } else {
                //sendFriendRequest(requestReceiver, req, res);
                FriendRequest.sendFriendRequest(requestReceiver, req, function(err, code, content){
                    if (err) {
                        utils.sendErrResponse(res, code, content);      
                    }
                    else{
                        utils.sendSuccessResponse(res, content);
                    }
                });
            }
        });
    }
})

// Creates a new friend request from the logged in user to the user with the given username.
router.post('/byUsername', isAuthenticated, function(req, res) {
    var requestTo = req.body.to;
    if (requestTo === req.user.username) {
        utils.sendErrResponse(res, 500, 'Cannot send a friend request to yourself!.');
    } else {
        User.findOne({ username: requestTo }, function(err1, requestReceiver) {
            if (err1) {
                utils.sendErrResponse(res, 500, 'There was an error!');
            } else if (requestReceiver === null) {
                utils.sendErrResponse(res, 500, 'No such user found!');
            } else {
                FriendRequest.sendFriendRequest(requestReceiver, req, function(err, code, content){
                    if (err) {
                        utils.sendErrResponse(res, code, content);      
                    }
                    else{
                        utils.sendSuccessResponse(res, content);
                    }
                });
                //sendFriendRequest(requestReceiver, req, res);
            }
        });
    }
})

// Accepts a friend request.
// Adds the user to the other user's friends list and adds the other user
// to the current user's friends list and deletes the friend request.
router.post('/:requestId/accept', isAuthenticated, function(req, res) {
    var requestId = req.params.requestId;
    console.log(requestId, req.user._id);
    FriendRequest.findOne({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
            utils.sendErrResponse(res, 500, 'There was an error! Could not get requests.');
        } else if (request === null){
            utils.sendErrResponse(res, 500, 'No such request exists!.');
        } else {
            FriendRequest.friendEachOther(req.user._id, request.from, FriendRequest.deleteRequest(req, requestId, function(err, code, content){
                    if (err) {
                        utils.sendErrResponse(res, code, content);      
                    }
                    else{
                        utils.sendSuccessResponse(res, content);
                    }
                }), function(err, code, content){
                    if (err) {
                        utils.sendErrResponse(res, code, content);      
                    }
                    else{
                        utils.sendSuccessResponse(res, content);
                    }
                });
        }
    });
});

// Rejects a friend request by deleting the request.
router.post('/:requestId/reject', isAuthenticated, function(req, res) {
    var requestId = req.params.requestId;
    // deleteRequest(req, res, requestId);
    FriendRequest.deleteRequest(req, requestId, function(err, code, content){
                    if (err) {
                        utils.sendErrResponse(res, code, content);      
                    }
                    else{
                        utils.sendSuccessResponse(res, content);
                    }
                });
});

module.exports = router;
