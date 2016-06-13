var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var auth = require('./internal/user/auth');
//var pmx = require('pmx');
var routes = require('./internal/routers/router');
import serverInit from './internal/init';

var app = express();

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/app/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.enable('trust proxy');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(__dirname + '/../app'));
app.use(auth.allowCrossOrigin);

/**
 * Fills acm accounts for async queue
 */
serverInit();

/*
 * Connecting routers
 */

app.get('/partials\/*:filename', routes.partials);
app.use('/', routes.index);
app.use('/api', routes.api);

app.all('/*', function(req, res, next) {
  // Just send the index.jade for other files to support html5 mode in angular routing
  res.render('index/index');
});

//app.use(pmx.expressErrorHandler());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  //noinspection TypeScriptUnresolvedVariable
  err['status'] = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.end();
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.end();
});


module.exports = app;