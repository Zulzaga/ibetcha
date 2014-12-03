// Passport strategy for Venmo authentication.
// Not used for MVP.
var User = require('../models/User');

var localLogin = require('./passport/localLogin');
var localSignup = require('./passport/localSignup');

module.exports = function(passport) {
    // serialize sessions
    passport.serializeUser(function(user, next) {
        next(null, user);
    });

    passport.deserializeUser(function(user, next) {
        next(null, user);
    });

    passport.use('login', localLogin);
    passport.use('signup', localSignup);
}
