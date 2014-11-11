var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var User = require('../models/User');

// Routing for the testing page
router.get('/', function(req, res) {
	//cleanCollections();

	var urlString = "http://localhost:5000/";
	// if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
	//     urlString = "http://mitmap-dhlim.rhcloud.com/";
	// }
	res.render('test.ejs', {urlString: urlString});
});


// Remove contents of all the collections in db before testing
var cleanCollections = function() {
	User.remove({}, function(err) { 
	   console.log('users removed') 
	});
}


module.exports = router;