var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport')
var VenmoStrategy = require('passport-venmo').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');
var bets = require('./routes/bets');
var milestones = require('./routes/milestone/milestones');
var test = require('./routes/test');

var app = express();

var connection_string = 'localhost/ibetcha';


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
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);
app.use('/bets', bets);
app.use('/milestones', milestones);
app.use('/test', test);

var User = require('./models/User');

// // strategy for authentication
// passport.use('login', new VenmoStrategy({
//     clientID: "2088",
//     clientSecret: "wuG43PaVwh2kgJFwNxmJZuXLwYaF3Sbc",
//     callbackURL: "http://localhost:3000/auth/venmo/callback"
//   },

//   function(accessToken, refreshToken, venmo, done) {
//     console.log(venmo);
//     User.findOne({ 'venmo.id' : venmo.id }, function(err, user) {
//       if (err) { return done(err); }
//       if (user) {
//         return done(null, user);
//       } else {
//             // if there is no user found with that facebook id, create them
//             var newUser = new User();
//             console.log(profile)

//             // set all of the facebook information in our user model
//             newUser.venmo.id = profile.id; // set the users facebook id                   

//             // save our user to the database
//             newUser.save(function(err) {
//                 if (err)
//                     throw err;

//                 // if successful, return the new user
//                 return done(null, newUser);
//             });
//       }
//     });
//   }
// ));


// strategy for authentication
passport.use(new VenmoStrategy({
    clientID: "2088",
    clientSecret: "wuG43PaVwh2kgJFwNxmJZuXLwYaF3Sbc",
    callbackURL: "http://localhost:3000/auth/venmo/callback"
  },

  function(accessToken, refreshToken, venmo, done) {
    console.log("Boop boop");
    User.findOne({ 'venmo.id' : venmo.id }, function(err, user) {
      if (err) { return done(err); }
      if (user) {
        return done(null, user);
      } else {
            // if there is no user found with that facebook id, create them
            User.create({'id': venmo.id, 'name': venmo.displayName, 'email': venmo.email}, venmo.displayName, function (err, user) {
                if (err) {
                    return done(err);
                } else if (user === null){
                    return done(null, false, { error: "Could not create a new user!", success: false });
                } else {
                    return done(null, user);
                }
            })
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


module.exports = app;
