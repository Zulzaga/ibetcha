var mongoose = require("mongoose"),
	ObjectId = mongoose.Schema.ObjectId;
	Schema = mongoose.Schema;

var Bet = require("./Bet");
var PaymentRequest = require('./PaymentRequest');

// Schema for keeping track of who owes what
var PaymentRequestSchema = new Schema({
	from : {type: ObjectId, ref: 'User', required: true},
	to : {type: ObjectId, ref: 'User', required: true},
	amount: {type: Number, required:true},
	requested: {type: Boolean, required:true}
});

// Methods
PaymentRequestSchema.statics.processPaymentClaim = function(objectId, setParams, responseCallback, res) {
	return PaymentRequest.findOneAndUpdate(objectId, setParams, function(err, payment) {
		if(err) {
			responseCallback(true, 500, "There was an error", res);
		} else {
			responseCallback(false, 200, payment, res);
		}
	});
}

PaymentRequestSchema.statics.confirmPaymentClaim = function(objectId, responseCallback, res) {
	return PaymentRequest.findOneAndRemove(objectId, function(err, payment) {
		if(err) {
			responseCallback(true, 500, "There was an error", res);
		} else {
			responseCallback(false, 200, payment, res);
		}
	});
}

PaymentRequestSchema.statics.getUserPayments = function(userId, responseCallback, res) {
	PaymentRequest.find({ 'from': userId }).populate('from to').exec(function(err, froms) {
        if (err) {
            responseCallback(true, 500, 'There was an error', res);
        } else {
            PaymentRequest.find({ 'to': userId}).populate('from to').exec(function(err, tos) {
                if (err) {
                    responseCallback(true, 500, 'There was an error', res);
                } else {
                    responseCallback(false, 200, { 'froms': froms, 'tos': tos }, res);
                }
            });
        }
    });
}

//Bindings
var PaymentRequest = mongoose.model('PaymentRequest', PaymentRequestSchema);

module.exports = PaymentRequest;
