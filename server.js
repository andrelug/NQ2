var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mongoose = require('mongoose');

var app = express();
/*
mongoose.connect('mongodb://localhost/normalquestions');

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
        loginName: String
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
    */
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

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// All Users
app.get('/users', function (req, res) {
    Users.find({}, function (err, docs) {
        var show = [];
        for(i=0;i< docs.length; i++){
            if(docs[i].deleted === false){
                show.push(docs[i]);
            }
        }
        res.render('users/index', { users: show});
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
    res.render("users/show", { user: req.loginName});
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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
