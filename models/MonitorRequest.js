var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

//Milestones Schema
var monitorRequestSchema = new Schema({
	// date: Date,

	from:{
		type: ObjectId,
		ref: 'User'
	},
	to:{
		type: ObjectId,
		ref: 'User'
	},
	bet:{
		type: ObjectId,
		ref: 'Bet'
	}
});

monitorRequestSchema.statics.create = function(from, to, bet, callback) {
    var newRequest = new MonitorRequest({
        'from': from,
        'to': to,
        'bet': bet
    });

    newRequest.save(callback);
}


//Bindings
var MonitorRequest = mongoose.model('MonitorRequest', monitorRequestSchema);

module.exports = MonitorRequest;
