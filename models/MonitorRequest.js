var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

// Monitor Request Schema
var monitorRequestSchema = new Schema({
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

//Bindings
var MonitorRequest = mongoose.model('MonitorRequest', monitorRequestSchema);

module.exports = MonitorRequest;
