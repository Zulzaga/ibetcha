var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

// Schema for keeping track of who owes what
var MoneyRecordSchema = new Schema({
	friend: {type: ObjectId, required: true},
	amount: {type:Number, required:true}
});

// MoneyRecordSchema.statics.create = function(friend, amount, callback) {
//     var newRequest = new MoneyRecord({
//         'friend': friend,
//         'amount': amount
//     });

//     newRequest.save(callback);
// }


//Bindings
var MoneyRecord = mongoose.model('MoneyRecord', MoneyRecordSchema);

module.exports = MoneyRecord;
