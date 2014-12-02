// Passport strategy for Venmo authentication.
// Not used for MVP.
var passport = require('passport');
var passwordHash = require('password-hash');
var LocalStrategy = require('passport-local').Strategy;
var VenmoStrategy = require('passport-venmo').Strategy;
var User = require('./models/User');

passport.serializeUser(function(user, next) {
    // store user id
    next(null, user);
});

passport.deserializeUser(function(user, next) {
    next(null, user);
});

passport.use(new VenmoStrategy({
        clientID: "2096",
        clientSecret: "3pm76Jsh2tqdV2TcmRxAyBn9C6uNu2rq",
        callbackURL: "http://localhost:5000/auth/venmo/callback",
        passReqToCallback: true
    }, function(req, accessToken, refreshToken, venmo, done) {
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
));

// Passport Strategy for login.
passport.use('login', new LocalStrategy({
        passReqToCallback: true
    }, function(req, username, password, done) {
        // find a user in Mongo with provided username
        User.findOne({'username': username}, function(err, user) {
            // In case of any error return
            if (err){
                return done(err);
            }
            // already exists
            if (!user) {
                return done(null, false, 'User does not exist');
            } else {
                if (!passwordHash.verify(password, user.password)) {
                    return done(null, false, 'Wrong username and password combination!');
                }

                return done(null, user);
            }
        });
    }
));

// Passport Strategy for creating a new user.
passport.use('signup', new LocalStrategy({
        passReqToCallback: true
    }, function(req, username, password, done) {
        // find a user in Mongo with provided username
        User.findOne({'username': username}, function(err, user) {
            // In case of any error return
            if (err){
                return done(err);
            }
            // already exists
            if (user) {
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
));
));

// Login Required middleware.

exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

// Authorization Required middleware.

exports.isAuthorized = function(req, res, next) {
    var provider = req.path.split('/').slice(-1)[0];

    if (_.find(req.user.tokens, { kind: provider })) {
        next();
    } else {
        res.redirect('/auth/' + provider);
  }
};
