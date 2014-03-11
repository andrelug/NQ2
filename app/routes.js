var Users = require('./models/user');
var Stats = require('./models/stats');
schedule = require('node-schedule');

var total,
    male,
    female;

var j = schedule.scheduleJob('* * * * *', function () {

    Users.count({}, function (err, docs) {
        Stats.update({ 'name': 'stats' }, { $set: { 'users.total': docs} }, function (err, stats) {
            total = docs;
        });
    });
    Users.count({ gender: "male" }, function (err, docs) {
        Stats.update({ 'name': 'stats' }, { $set: { 'users.male': docs} }, function (err, stats) {
            male = docs;
        });
    });
    Users.count({ gender: "female" }, function (err, docs) {
        Stats.update({ 'name': 'stats' }, { $set: { 'users.female': docs} }, function (err, stats) {
            female = docs;
        });
    });
});

// Session check function
var sessionReload = function(req, res, next){
    if('HEAD' == req.method || 'OPTIONS' == req.method){
        return next();
    }else{
        req.session._garbage = Date();
        req.session.touch();
    }
}

module.exports = function (app, passport, mongoose) {

    // =====================================
    // HOME PAGE ===========================
    // =====================================
    app.get('/', function (req, res) {
        var user = req.user;
        if (!user) {
            res.render("index", { message: req.flash('signupMessage') });
        } else {
            res.redirect("/users");
        }
    });

    // =====================================
    // AJAX GET NAME =======================
    // =====================================
    app.get("/name", function (req, res) {
        Users.find({ 'name.first': req.query.name }, { 'name.first': 1, _id: 0 }, function (err, docs) {
            if (!total) {
                Stats.find({ 'name': 'stats' }, { 'users.total': 1, _id: 0 }, function (err, stats) {
                    total = stats[0].users.total;
                    var sendName = { total: total, name: docs.length };
                    res.end(JSON.stringify(sendName));
                });
            } else {
                var sendName = { total: total, name: docs.length };
                res.end(JSON.stringify(sendName));
            }
        });
    });

    // =====================================
    // AJAX GET AGE ========================
    // =====================================
    app.get('/a/:age', function (req, res) {
        var myDate = new Date();
        var dateCal = req.params.age * 365.25;
        myDate.setDate(myDate.getDate() - dateCal);
        var start = new Date();
        var ano = dateCal + 365.25;
        start.setDate(start.getDate() - ano);

        Users.find({ birthDate: { $gte: start, $lte: myDate} }, { birthDate: 1, _id: 0 }, function (err, docs) {
            if (!male || !female) {
                Stats.find({ 'name': 'stats' }, function (err, stats) {
                    male = stats[0].users.male;
                    female = stats[0].users.female;
                    total = stats[0].users.total;
                    var sendAge = { total: total, male: male, female: female, ageNum: docs.length };
                    res.end(JSON.stringify(sendAge));
                });
            }else{
                var sendAge = { total: total, male: male, female: female, ageNum: docs.length };
                res.end(JSON.stringify(sendAge));
            }
        });
    });


    // =====================================
    // USER SIGNUP =========================
    // ===================================== I should later find a way to pass params to the jade file here and put values on the inputs
    app.post('/newUser', passport.authenticate('local-signup', {
        successRedirect: '/users', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages     
    }));

    // =====================================
    // LOG IN ==============================
    // =====================================
    app.get('/login', function (req, res) {
        var user = req.user;
        if (!user) {
            res.render("login", { message: req.flash('loginMessage') });
            if (req.url === '/favicon.ico') {
                r.writeHead(200, { 'Content-Type': 'image/x-icon' });
                return r.end();
            }
        } else {
            res.redirect("/users");
        }
    });


    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/users', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGN UP  ============================
    // =====================================
    app.get('/signup', function (req, res) {
        var user = req.user;
        if (!user) {
            res.render("signup", { message: req.flash('signupMessage') });
        } else {
            res.redirect("/users");
        }
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_about_me',
    'user_birthday ', 'user_hometown', 'user_website']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
	    passport.authenticate('facebook', {
	        successRedirect: '/users',
	        failureRedirect: '/'
	    })
    );

    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
		    successRedirect: '/users',
		    failureRedirect: '/'
		})
    );

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/users',
            failureRedirect: '/'
        })
    );


    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/users/edit', isLoggedIn, function (req, res) {
        var user = req.user;
        res.render('users/edit', { message: req.flash('loginMessage'), user: user });
    });
    app.post('/users/edit', passport.authenticate('local-signup', {
        successRedirect: '/users', // redirect to the secure profile section
        failureRedirect: '/users/edit', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope: ['email', 'user_about_me',
    'user_birthday ', 'user_hometown', 'user_website']
    }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
			    successRedirect: '/users',
			    failureRedirect: '/'
			})
        );

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
			    successRedirect: '/users',
			    failureRedirect: '/'
			})
        );


    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email', 'openid'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
			passport.authorize('google', {
			    successRedirect: '/users',
			    failureRedirect: '/'
			})
        );


    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // facebook -------------------------------
    app.get('/unlink/facebook', function (req, res) {
        var user = req.user;
        user.social.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/users');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function (req, res) {
        var user = req.user;
        user.social.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/users');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function (req, res) {
        var user = req.user;
        user.social.google.token = undefined;
        user.save(function (err) {
            res.redirect('/users');
        });
    });



    // =====================================
    // ALL USERS ===========================
    // =====================================
    app.get('/users', isLoggedIn, function (req, res, next) {
        var user = req.user;

        Users.find({ deleted: false }, function (err, docs) {
            sessionReload(req, res, next);
            res.render('users/index', { users: docs, user: user });
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // NEW USER ============================
    // =====================================
    app.get('/users/new', function (req, res) {
        res.render('users/new');
    });


    // =====================================
    // CREATE USER =========================
    // =====================================
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
        }).save(function (err, docs) {
            if (err) res.json(err);
            res.redirect('/users/' + docs.name.loginName);
        });
    });


    // =====================================
    // LOGINNAME PARAM =====================
    // =====================================
    /*app.param('loginName', function (req, res, next, loginName) {
    var user = req.user;
    Users.find({ 'name.loginName': user.name.loginName }, function (err, docs) {
    req.loginName = docs[0];
    next();
    });
    });*/

    // =====================================
    // SHOW USER ===========================
    // =====================================
    app.get('/users/:loginName', function (req, res) {
        if (req.loginName.deleted === false) {
            res.render("users/show", { user: req.loginName });
        } else {
            res.render("users/restore", { user: req.loginName })
        }
    });




    // =====================================
    // DELETE USER =========================
    // =====================================
    app.put('/users/:loginName/delete', function (req, res) {
        Users.update(
            { 'name.loginName': req.params.loginName },
            { $set: {
                deleted: true
            }
            },
            function (err) {
                res.redirect('/users')
            }
        );
    });

    // =====================================
    // RESTORE USER ========================
    // =====================================
    app.put('/users/:loginName/restore', function (req, res) {
        Users.update(
            { 'name.loginName': req.params.loginName },
            { $set: {
                deleted: false
            }
            },
            function (err) {
                res.redirect('/users')
            }
        );
    });

    // =====================================
    // TEST AGE VARIABLES ==================
    // =====================================
    app.get('/test/:age', function (req, res) {
        var myDate = new Date();
        var dateCal = req.params.age * 365.25;
        myDate.setDate(myDate.getDate() - dateCal);
        var start = new Date();
        var ano = dateCal + 365.25;
        start.setDate(start.getDate() - ano);

        Users.find({ birthDate: { $gte: start, $lte: myDate} }, { birthDate: 1, _id: 0 }, function (err, docs) {

            var sendAge = { total: total, male: male, female: female, ageNum: docs.length };

            res.send(sendAge);

        });
    });

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}