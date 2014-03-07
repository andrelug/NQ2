require('newrelic');
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , cronJob = require('cron').CronJob
  , mongoose = require('mongoose');

var app = express();

if ('development' == app.get('env')) {
  var connectionString = 'mongodb://localhost/normalquestions'
}else{
  var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI
}

mongoose.connect(connectionString);

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
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// Cron jobs
var total,
    male,
    female;
var job = new cronJob('00 00 03 * * *', function(){
    Users.count({}, function(err, docs){
        total = docs;
    });
    Users.count({gender: "male"}, function(err, docs){
        male = docs;
    });
    Users.count({gender: "female"}, function(err, docs){
        female = docs;
    });
  },
  null,
  true,
  timeZone "America/Los_Angeles"
);

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// All Users
app.get('/users', function (req, res) {
    Users.find({deleted: false}, function (err, docs) {
        res.render('users/index', { users: docs});
    });
});

// New User
app.get('/users/new', function (req, res) {
    res.render('users/new');
});

// Create

app.post('/users', function (req, res) {
    var b = req.body;
    new Users({
        name: {
            first: b.firstName,
            middle: b.middleName,
            last: b.lastName,
            nickName: b.nickName,
            loginName: b.loginName
        },
        birthDate: b.birthDate,
        email: b.email,
        gender: b.gender,
        password: {
            main: b.password
        },
        localization: {
            country: b.country,
            state: b.state,
            city: b.city,
            zipcode: b.zipcode,
            telephone: b.telephone
        }
    }).save(function(err, docs){
       if(err) res.json(err);
       res.redirect('/users/' + docs.name.loginName); 
    });
});

app.param('loginName', function(req, res, next, loginName){
    Users.find({ 'name.loginName': loginName}, function(err, docs){
       req.loginName = docs[0];
       next();
    });
});

// Show user
app.get('/users/:loginName', function(req, res){
    if (req.loginName.deleted === false){
        res.render("users/show", { user: req.loginName});
    } else{
        res.render("users/restore", {user: req.loginName})
    }
});

// Edit user
app.get('/users/:loginName/edit', function(req, res){
   res.render("users/edit", { user: req.loginName }); 
});

// Update user
app.put('/users/:loginName', function (req, res) {
    var b = req.body;
    Users.update(
        { 'name.loginName': req.params.loginName },
        { $set: {
            name: {
                first: b.firstName,
                middle: b.middleName,
                last: b.lastName,
                nickName: b.nickName,
                loginName: b.loginName
            },
            birthDate: b.birthDate,
            email: b.email,
            gender: b.gender,
            password: {
                main: b.password
            },
            localization: {
                country: b.country,
                state: b.state,
                city: b.city,
                zipcode: b.zipcode,
                telephone: b.telephone
            }
        }
        },
        function (err) {
            res.redirect("/users/" + b.loginName);
        }
    );
});


// Delete user
app.put('/users/:loginName/delete', function(req, res){
    Users.update(
        {'name.loginName': req.params.loginName},
        {$set: {
            deleted: true
        }},
        function(err){
            res.redirect('/users')
        }
    );
});

// Restore user
app.put('/users/:loginName/restore', function(req, res){
    Users.update(
        {'name.loginName': req.params.loginName},
        {$set: {
            deleted: false
        }},
        function(err){
            res.redirect('/users')
        }
    );
});

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

app.get('/test/:age', function(req, res){
    var myDate = new Date();
    var dateCal = req.params.age * 365.25;
    myDate.setDate(myDate.getDate()-dateCal);
    var start = new Date();
    var ano = dateCal + 365.25;
    start.setDate(start.getDate()-ano);

    Users.find({birthDate: {$gte: start, $lte: myDate}},{birthDate: 1, gender: 1, _id: 0}, function(err, docs){

        Users.count(function(err, size){
            docs.gender
            var sendAge = { total: size, male: docs.gender};
        });
        

        
        //res.send(docs.length);
    });
});

// Get ajax age
app.get('/a/:age', function(req, res){
    var myDate = new Date();
    var dateCal = req.params.age * 365.25 ;
    myDate.setDate(myDate.getDate()-dateCal);
    var start = new Date(myDate.setDate(myDate.getDate()-365.25));

    Users.find({birthDate: {$gte: start, $lte: myDate}},{birthDate: 1, gender: 1, _id: 0}, function(err, docs){
        var sendAge = getAge(docs[2].birthDate);

        
        res.send("<h1>" + myDate + "</h1>");
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
