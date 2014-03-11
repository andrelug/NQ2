require('newrelic');
var express = require('express')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , flash 	 = require('connect-flash')
  , configDB = require('./config/database.js')
  , Users = require('./app/models/user');

var app = express();

if ('development' == app.get('env')) {
  var connectionString = 'mongodb://localhost/normalquestions'
}else{
  var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI
}

mongoose.connect(configDB.url);

require('./config/passport.js')(passport); // pass passport for configuration

var QuestionSchema = new mongoose.Schema({
    question: String,
    answer:{
        users:[{
            loginName: String,
            answer: String
        }]
    }
}),
    Questions = mongoose.model('Questions', QuestionSchema);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'cmsk3sle2i32lçcoe90ksd', cookie: {maxAge: 5000}}));
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// =====================================
// ROUTES ==============================
// =====================================

/*
// non-www to www
app.all('*', function(req, res, next) {
  if (req.headers.host.slice(0, 3) != 'www') {
    res.redirect(301, 'http://www.' + req.headers.host + req.url);
  } else {
    next();
  }
}); */

require('./app/routes.js')(app, passport, mongoose);

app.configure('development', function(){
  app.use(express.errorHandler());
});



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
