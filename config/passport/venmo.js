/**
 * Passport Venmo
 */

var VenmoStrategy = require('passport-venmo').Strategy;
var User = require('../../models/User');

// Expose 

module.exports = new VenmoStrategy({
    clientID: "2096",
    clientSecret: "3pm76Jsh2tqdV2TcmRxAyBn9C6uNu2rq",
    callbackURL: "http://localhost:5000/auth/venmo/callback",
    passReqToCallback: true
    },
    function(req, accessToken, refreshToken, venmo, done) {
        User.findOne({ 'venmo.id' : venmo.id }, function(err, user) {
            if (err) { 
                return done(err); 
            } else if (user) {
                return done(err, user);
            } else {
                user = new User({
                    username: venmo.displayName,
                    email: venmo.email,
                    access_token: accessToken,
                    friends: [],
                    bets: [],
                    rating: 2,
                    venmo: {
                        id: venmo.id,
                        name: venmo.displayName,
                    }
                });

                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                })
            }
        });
    }
);