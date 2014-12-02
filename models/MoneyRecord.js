var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var Bet = require("./Bet");
var MoneyRecord = require('./MoneyRecord');

// Schema for keeping track of who owes what
var MoneyRecordSchema = new Schema({
	from : {type: ObjectId, ref: 'User', required: true},
	to : {type: ObjectId, ref: 'User', required: true},
	amount: {type: Number, required:true},
	requested: {type: Boolean, required:true}
});



// Methods
MoneyRecordSchema.statics.processPaymentClaim = function(objectId, setParams, cb) {
	
	console.log(objectId, setParams);
	return MoneyRecord.findOneAndUpdate(objectId, setParams, function(err, payment) {
		if(err) {
			console.log(err);
			cb(true, 500, "There was an error");
		} else {
			console.log("pppp", payment);
			cb(false, 200, payment);
		}
	});
}

MoneyRecordSchema.statics.confirmPaymentClaim = function(objectId, cb) {
	return MoneyRecord.findOneAndRemove(objectId, function(err, payment) {
		if(err) {
			console.log("dammmmmmmmmmmmmmmmmmmm");
			cb(true, 500, "There was an error");
		} else {
			console.log(payment)
			cb(false, 200, payment);
		}
	});
}

//Bindings
var MoneyRecord = mongoose.model('MoneyRecord', MoneyRecordSchema);

module.exports = MoneyRecord;
