var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

// Schema for keeping track of who owes what
var MoneyRecordSchema = new Schema({
	from : {type: ObjectId, ref: 'User', required: true},
	to : {type: ObjectId, ref: 'User', required: true},
	amount: {type: Number, required:true}
});

//Bindings
var MoneyRecord = mongoose.model('MoneyRecord', MoneyRecordSchema);

module.exports = MoneyRecord;
