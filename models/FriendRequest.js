var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var User = require('./User');

//========================== SCHEMA DEFINITION ==========================
// Friend Request Schema
var friendRequestSchema = new Schema({
	from:{
		type: ObjectId,
		ref: 'User'
	},
	to:{
		type: ObjectId,
		ref: 'User'
	}
});

//============================ SCHEMA STATICS ============================

/* Checks if the two users are already friends and if not, creates a friend request from a user to another */
friendRequestSchema.statics.create = function(from, to, responseCallback) {    
    if (to.friends && to.friends.indexOf(from._id) == -1) {
        var newRequest = new FriendRequest({
            'from': from._id,
            'to': to._id
        });

        newRequest.save(function(err, request) {
            if (err) {
                responseCallback(true, 500, 'There was an error');
            } else {
                responseCallback(false, 200, request);
            }
        });
    } else {
        responseCallback(true, 500, "You already have this friend.");
    }
}

// Adds one user as another's friend
friendRequestSchema.statics.friendOne = function(userid1, userid2, responseCallback1, responseCallback2) {
    User.findById(userid1, function(error, user1) {
        if(error) {
            responseCallback2(true, 500, "Internal Error has occurred");
        } else {
            user1.update({$push: { 'friends' : userid2}}, {upsert: true}, function(error, model1) {
                if(error) {
                    responseCallback2(true, 500, "Internal Error has occurred"); 
                } else {
                    responseCallback1;
                }
            });
        }
    });
};

// Given that User A has confirmed User B's friend request,
// Make both of them friends
friendRequestSchema.statics.friendEachOther = function(userid1, userid2, responseCallback1, responseCallback2) {
    // Call friendOne function on each other
	FriendRequest.friendOne(userid1, userid2,  
        FriendRequest.friendOne(userid2, userid1, 
            responseCallback1, responseCallback2), responseCallback2);
} 

// Send friendRequest from User A to User B.
// Simulate friendRequest going to both directions to catch edge cases
// If everything is fine, create the friendRequest object to be confirmed by User B.
friendRequestSchema.statics.sendFriendRequest = function(to, req, responseCallback){
    FriendRequest.findOne({ 'to': to._id, 'from': req.user._id }, function (err1, request1) {
        if (err1) {
            responseCallback(true, 500, 'There was an error! Could not get requests.');
        } else if (request1 === null) {
            FriendRequest.findOne({ 'from': to._id, 'to': req.user._id }, function (err1, request2) {
                if (err1) {
                    responseCallback(true, 500, 'There was an error! Could not get requests.');
                } else if (request2 === null) {
                    FriendRequest.create(req.user, to, responseCallback);
                } else {
                    responseCallback(true, 500, 'The user already sent a friend request to you. Go to your Home Page and click on Friends/FriendRequests page to accept.');
                }
            });
        } else {
            responseCallback(true, 500, 'Already sent a friend request. Cannot send a request again. Wait for your friend to accept!');
        }
    });
}

/*Delete a friend request*/
friendRequestSchema.statics.deleteRequest = function(req, requestId, responseCallback) {
	FriendRequest.findOneAndRemove({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
            responseCallback(true, 500, 'There was an error! Could not find request.')
        } else if (request == null){
            responseCallback(true, 500, 'No such request exists!.');
        } else {
            responseCallback(false, 200, request);
        }
    });
}

//Bindings
var FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
