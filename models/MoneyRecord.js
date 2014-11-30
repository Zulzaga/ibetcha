var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var Bet = require("./Bet");

// Schema for keeping track of who owes what
var MoneyRecordSchema = new Schema({
	from : {type: ObjectId, ref: 'User', required: true},
	to : {type: ObjectId, ref: 'User', required: true},
	amount: {type: Number, required:true},
	requested: {type: Boolean, required:true}
});




//Bindings
var MoneyRecord = mongoose.model('MoneyRecord', MoneyRecordSchema);

// Methods
MoneyRecordSchema.statics.processPaymentClaim = function(objectId, setParams, cb) {
	return MoneyRecord.findOneAndUpdate(objectId, setParams, cb);
}

MoneyRecordSchema.statics.confirmPaymentClaim = function(objectId, cb) {
	return MoneyRecord.findOneAndRemove(ObjectId, cb);
}

module.exports = MoneyRecord;
