var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;


var routes = require('./routes/index');
var users = require('./routes/users');
var bets = require('./routes/bets');
var milestones = require('./routes/milestone/milestones');

var app = express();
var connection_string = 'localhost:27017/ibetcha';

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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/bets', bets);
app.use('/milestones', milestones);

var User = require('../model/user');

// // strategy for authentication
// passport.use(new FacebookStrategy({
//     clientID: "341293122717646",
//     clientSecret: "c596a5dd015b8580e4cba5a0319de2a7",
//     callbackURL: "http://localhost:8080/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOne({}, function(err, user) {
//       if (err) { return done(err); }
//       done(null, user);
//     });
//   }
// ));

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

passport.deserializeUser(function(id, next) {
    next(null, id);
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


module.exports = app;
