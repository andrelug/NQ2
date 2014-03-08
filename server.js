require('newrelic');
var express = require('express')
  , http = require('http')
  , path = require('path')
  , schedule = require('node-schedule')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , flash 	 = require('connect-flash')
  , configDB = require('./config/database.js');

var app = express();

require('./app/routes.js')(app, passport, mongoose);

if ('development' == app.get('env')) {
  var connectionString = 'mongodb://localhost/normalquestions'
}else{
  var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI
}

mongoose.connect(configDB.url);

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

var UserSchema = new mongoose.Schema({
    name: {
        first: String,
        middle: String,
        last: String,
        nickName: String,
        loginName: {type: String, lowercase: true, trim: true, required: true, unique: true, index: true}
    },
    birthDate: Date,
    email: String,
    gender: String,
    password: {
        main: String,
        past: {
            past1: String,
            past2: String
        }
    },
    localization: {
        country: String,
        state: String,
        city: String,
        zipcode: Number,
        telephone: Number
    },
    logIn: {
        logins: [{
            at: Date
        }],
        recordedIp: {
            last: Number,
            past: {
                past1: Number,
                past2: Number
            }
        }
    },
    social: {
        facebook: {
            auth: String,
            email: String,
            url: String,
            likes: [String]
        },
        twitter:{
            url: String
        }
    },
    deleted: {type: Boolean, default: false}
}),
    Users = mongoose.model('Users', UserSchema);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'cmsk3sle2i32lçcoe90ksd'}));
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Cron jobs
var total,
    male,
    female;

var j = schedule.scheduleJob('00 * * * *', function(){
    Users.count({}, function(err, docs){
        total = docs;
    });
    Users.count({gender: "male"}, function(err, docs){
        male = docs;
    });
    Users.count({gender: "female"}, function(err, docs){
        female = docs;
    });
});


app.configure('development', function(){
  app.use(express.errorHandler());
});



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
