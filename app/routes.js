module.exports = function (app, passport, mongoose) {

    // =====================================
	// HOME PAGE ===========================
	// =====================================
    app.get('/', function (req, res) {
        res.render("index"/*, { message: req.flash('signupMessage') }*/);
    });

    // =====================================
	// AJAX GET NAME =======================
	// =====================================
    app.get("/name", function (req, res) {
        Users.find({ 'name.first': req.query.name }, { 'name.first': 1, _id: 0 }, function (err, docs) {
            var sendName = { total: total, name: docs.length };
            res.end(JSON.stringify(sendName));
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

            var sendAge = { total: total, male: male, female: female, ageNum: docs.length };

            res.end(JSON.stringify(sendAge));

        });
    });


    // =====================================
	// USER SIGNUP =========================
	// =====================================
    app.post("/newUser", function (req, res) {
        var b = req.body;
        new Users({
            name: {
                first: b.firstName,
                loginName: b.loginName
            },
            email: b.email,
            gender: b.gender,
            password: {
                main: b.password
            }
        }).save(function (err, docs) {
            if (err) res.json(err);
            res.redirect('/users/' + docs.name.loginName);
        });
    });

    // =====================================
	// LOG IN ==============================
	// =====================================
    app.get('/login', function (req, res) {
        res.render("login"/*, { message: req.flash('loginMessage') }*/)
    });


    // =====================================
	// PROFILE PAGE ========================
	// =====================================
    app.get('/profile', isLoggedIn, function(req, res) {
		res.render('users/profile', {
			user : req.user // get the user out of session and pass to template
		});
	});

    // =====================================
	// ALL USERS ===========================
	// =====================================
    app.get('/users', isLoggedIn, function (req, res) {
        Users.find({ deleted: false }, function (err, docs) {
            res.render('users/index', { users: docs });
        });
    });

    // =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
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
    app.param('loginName', function (req, res, next, loginName) {
        Users.find({ 'name.loginName': loginName }, function (err, docs) {
            req.loginName = docs[0];
            next();
        });
    });

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
	// EDIT USER ===========================
	// =====================================
    app.get('/users/:loginName/edit', function (req, res) {
        res.render("users/edit", { user: req.loginName });
    });

    // =====================================
	// UPDATE USER =========================
	// =====================================
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