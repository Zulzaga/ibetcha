/**
 * Passport Local Signup
 */

var LocalStrategy = require('passport-local').Strategy;
var passwordHash = require('password-hash');
var User = require('../../models/User');

// Passport Strategy for login.
module.exports = new LocalStrategy({
        passReqToCallback: true
    }, function(req, username, password, done) {
        // find a user in Mongo with provided username
        User.findOne({'username': username}, function(err, user) {
            // In case of any error return
            if (err) {
                return done(err);
            } else if (user) {
                return done(null, false, 'Username is already taken!. Try again with a different username.');
            } else {
                User.findOne({'email': req.body.email}, function(err, user) {
                    // In case of any error return
                    if (err){
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        return done(null, false, 'Email is already taken! Try again with a different email.');
                    } else {
                        // if there is no user with that email
                        // create the user
                        User.create(req.body.username, req.body.password, req.body.email, function (err, user) {
                            if (err) {
                                return done(err);
                            } else if (user === null){
                                return done(null, false,  "Could not create a new user!");
                            } else {
                                return done(null, user);
                            }
                        });
                    }
                });
            }
        });
    }
);
