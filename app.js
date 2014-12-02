var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var passwordHash = require('password-hash');
var LocalStrategy = require('passport-local').Strategy;
var VenmoStrategy = require('passport-venmo').Strategy;
var CronJob = require('cron').CronJob;
var worker = require('./worker.js');

var routes = require('./routes/index');
var users = require('./routes/users');
var bets = require('./routes/bets');
var milestones = require('./routes/milestones');
var monitorRequests = require('./routes/monitorRequests');
var friendRequests = require('./routes/friendRequests');
var paymentRequests = require('./routes/paymentRequests');
var test = require('./routes/test');

var app = express();

var connection_string = process.env.MONGOLAB_URI || 'localhost/ibetcha';
console.log("connection_string: "+connection_string);


mongoose.connect(connection_string);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error:'));
db.once('open', function callback () {
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: "top secret", saveUninitialized: true, resave: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
app.use('/bets', bets);
app.use('/milestones', milestones);
app.use('/monitorRequests', monitorRequests);
app.use('/friendRequests', friendRequests);
app.use('/paymentRequests', paymentRequests);
app.use('/test', test);

// Passport strategy for Venmo authentication.
// Not used for MVP.
var User = require('./models/User');
passport.use(new VenmoStrategy({
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
));

// Passport Strategy for login.
passport.use('login', new LocalStrategy({
    passReqToCallback: true
    }, function(req, username, password, done) {
        // find a user in Mongo with provided username
        User.findOne({'username': username}, function(err, user) {
            // In case of any error return
            if (err){
                return done(null, false, 'There was an error!');
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
    },
    function(req, username, password, done) {
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

passport.serializeUser(function(user, next) {
    // store user id
    next(null, user);
});

passport.deserializeUser(function(user, next) {
    next(null, user);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var job = new CronJob({
  cronTime: '00 00 0,3,6,9,12,15,18,21 * * *', //runs everyday every 3 hours
  onTick: worker.start,
  start: false,
  timeZone: "America/New_York"
});
job.start();
module.exports = app;
