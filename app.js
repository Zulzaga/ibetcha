var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
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

/**/
var passportConfig = require('./config/passport');

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
