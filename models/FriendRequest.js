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

/* Makes two users friends */
friendRequestSchema.statics.friendEachOther = function(userid1, userid2, callback, responseCallback) {
	User.findById( userid1, function(error, user1) {
        if (error) {
            responseCallback(true, 500, "Internal Error has occurred"); 
        } else {
          user1.update({$push: { 'friends' : userid2}}, {upsert: true}, function(error2, model1) {
            if(error2) {
              responseCallback(true, 500, "Internal Error has occurred"); 
            } else {
              User.findById( userid2, function(error2, user2) {
                  user2.update({$push: { 'friends' : userid1}}, {upsert: true}, function(error3, model2){
                    if(error3) {
                      responseCallback(res, 500, "Internal Error has occurred"); 
                    } else {
                      callback;
                    }
                  });
              });
            }
          });
        } 
    });
} 

/* Send a friend request from a user to another*/
friendRequestSchema.statics.sendFriendRequest = function(to, req, callback){
	FriendRequest.findOne({ 'to': to._id, 'from': req.user._id }, function (err1, request1) {
        if (err1) {
            callback(true, 500, 'There was an error! Could not get requests.');
        } else if (request1 === null) {
            FriendRequest.findOne({ 'from': to._id, 'to': req.user._id }, function (err1, request2) {
                if (err1) {
                    callback(true, 500, 'There was an error! Could not get requests.');
                } else if (request2 == null) {
                    if (to.friends && to.friends.indexOf(req.user._id) == -1) {
                        FriendRequest.create(req.user._id, to._id, function(err2, request3) {
                            if (err2) {
                                callback(true, 500, 'There was an error');
                            } else {
                                callback(false, 200, request3);
                            }
                        })
                    } else {
                        callback(true, 500, "You already have this friend.");
                    }
                } else {
                    callback(true, 500, 'The user already sent a friend request to you. Go to your Home Page and click on Friends/FriendRequests page to accept.');
                }
            });
        } else {
            callback(true, 500, 'Already sent a friend request. Cannot send a request again. Wait for your friend to accept!');
        }
    });
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
