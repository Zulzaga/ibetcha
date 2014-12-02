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

/*Creates a friend request form a user to another */
friendRequestSchema.statics.create = function(from, to, callback) {
    var newRequest = new FriendRequest({
        'from': from,
        'to': to
    });

    newRequest.save(callback);
}

// Adds one user as another's friend
friendRequestSchema.statics.friendOne = function(userid1, userid2, callback, responseCallback) {
    User.findById(userid1, function(error, user1) {
        if(error) {
            responseCallback(true, 500, "Internal Error has occurred");
        } else {
            user1.update({$push: { 'friends' : userid2}}, {upsert: true}, function(error, model1) {
                if(error) {
                    responseCallback(true, 500, "Internal Error has occurred"); 
                } else {
                    callback;
                }
            });
        }
    });
};

// Given that User A has confirmed User B's friend request,
// Make both of them friends
friendRequestSchema.statics.friendEachOther = function(userid1, userid2, callback, responseCallback) {
    // Call friendOne function on each other
	FriendRequest.friendOne(userid1, userid2,  
        FriendRequest.friendOne(userid2, userid1, 
            callback, responseCallback), responseCallback);
} 

// Process User A "friend requesting" User B
friendRequestSchema.statics.sendSingleFriendRequest = function(toId, userId, errMsg1, errMsg2, callback, responseCallback) {
    FriendRequest.findOne({'to': toId, 'from': userId}, function(err, request) {
        if(err) {
            responseCallback(true, 500, errMsg1);
        } else if(request === null) {
            callback;
        } else {
            responseCallback(true, 500, errMsg2);
        }
    })
}

// Create a single friendRequest object for User A and User B 
friendRequestSchema.statics.createFriendRequest = function(to, userId, responseCallback) {
    if (to.friends && to.friends.indexOf(userId) == -1) {
        FriendRequest.create(userId, to._id, function(err2, request3) {
            if (err2) {
                responseCallback(true, 500, 'There was an error');
            } else {
                responseCallback(false, 200, request3);
            }
        });
    } else {
        responseCallback(true, 500, "You already have this friend.");
    }
}


// Send friendRequest from User A to User B.
// Simulate friendRequest going to both directions to catch edge cases
// If everything is fine, create the friendRequest object to be confirmed by User B.
friendRequestSchema.statics.sendFriendRequest = function(to, req, responseCallback){
    var errMsg1 = 'There was an error! Could not get requests.';
    var errMsg2 = 'Already sent a friend request. Cannot send a request again. Wait for your friend to accept!';
    var errMsg3 = "You already have this friend.";
    var errMsg4 = 'There was an error';
    var errMsg5 = 'The user already sent a friend request to you. Go to your Home Page and click on Friends/FriendRequests page to accept.';


    FriendRequest.sendSingleFriendRequest(to._id, req.user._id, errMsg1, errMsg2, 
        FriendRequest.sendSingleFriendRequest(req.user._id, to._id, errMsg1, errMsg5, 
         FriendRequest.createFriendRequest(to, req.user._id, responseCallback),
         responseCallback)
        ,responseCallback);
}

/*Delete a friend request*/
friendRequestSchema.statics.deleteRequest = function(req, requestId, callback) {
	FriendRequest.findOneAndRemove({ _id: requestId, to: req.user._id }, function (err, request) {
        if (err) {
           callback(true, 500, 'There was an error! Could not find request.')
        } else if (request == null){
            callback(true, 500, 'No such request exists!.');
        } else {
            callback(false, 200, request);
        }
    });
}


//Bindings
var FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
