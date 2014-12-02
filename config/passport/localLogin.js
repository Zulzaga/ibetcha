/**
 * Passport Local Login
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
            } else if (!user) {
                return done(null, false, 'User does not exist');
            } else {
                if (!passwordHash.verify(password, user.password)) {
                    return done(null, false, 'Wrong username and password combination!');
                }

                return done(null, user);
            }
        });
    }
);