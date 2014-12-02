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
	return MoneyRecord.findOneAndUpdate(objectId, setParams, function(err, payment) {
		if(err) {
			cb(true, 500, "There was an error");
		} else {
			cb(false, 200, payment);
		}
	});
}

MoneyRecordSchema.statics.confirmPaymentClaim = function(objectId, cb) {
	return MoneyRecord.findOneAndRemove(objectId, function(err, payment) {
		if(err) {
			cb(true, 500, "There was an error");
		} else {
			cb(false, 200, payment);
		}
	});
}

MoneyRecordSchema.statics.getUserPayments = function(userId, cb) {
	MoneyRecord.find({ 'from': userId }).populate('from to').exec(function(err, froms) {
        if (err) {
            cb(true, 500, 'There was an error');
        } else {
            MoneyRecord.find({ 'to': userId}).populate('from to').exec(function(err, tos) {
                if (err) {
                    cb(true, 500, 'There was an error');
                } else {
                    cb(false, 200, { 'froms': froms, 'tos': tos });
                }
            });
        }
    });
}




//Bindings
var MoneyRecord = mongoose.model('MoneyRecord', MoneyRecordSchema);

module.exports = MoneyRecord;
