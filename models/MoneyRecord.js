var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

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
MoneyRecordSchema.methods.processPaymentClaim = function(cb) {
	return MoneyRecord.find({ type: this.type }, cb);
}

module.exports = MoneyRecord;
