var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

//Friend Requests Schema
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

friendRequestSchema.statics.create = function(from, to, callback) {
    var newRequest = new FriendRequest({
        'from': from,
        'to': to
    });

    newRequest.save(callback);
}


//Bindings
var FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;
