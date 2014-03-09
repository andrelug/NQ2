var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var Users = require('../app/models/user');


// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (Users, done) {
        done(null, Users.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        Users.findById(id, function (err, Users) {
            done(err, Users);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'loginName',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, loginName, password, done) {
        // Get the other parameters
        var email = req.body.email,
            gender = req.body.gender,
            firstName = req.body.firstName;
       

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            Users.findOne({ 'email': email }, function (err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    Users.findOne({'name.loginName': loginName}, function(err, login){
                        if (err)
                            return done(err);

                        if (login) {
                            return done(null, false, req.flash('signupMessage', 'That username is already taken.'), {email: email, loginName: loginName, gender: gender, firstName: firstName});
                        } else{
                            // if there is no user with that email or username
                            // create the user
                            var newUser = new Users();

                            // set the user's local credentials
                            newUser.name.loginName = loginName;
                            newUser.email = email;
                            newUser.password.main = newUser.generateHash(password);
                            newUser.name.first = firstName;
                            newUser.gender = gender;

                            // save the user
                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });

                        }

                    });
                    
                }

            });

        });

    }));

};