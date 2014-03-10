var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var UserSchema = new mongoose.Schema({
    name: {
        first: String,
        middle: String,
        last: String,
        nickName: String,
        loginName: {type: String, lowercase: true, trim: true, required: true, unique: true, index: true}
    },
    birthDate: Date,
    email: {type: String, required: true, unique: true, index: true},
    gender: String,
    sites: [String],
    bio: String,
    photo: String,
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
            id: String,
            token: String,
            email: String,
            name: String,
            url: String,
            likes: {}
        },
        twitter:{
            id: String,
            token: String,
            displayName: String,
            username: String
        },
        google: {
            id: String,
            token: String,
            email: String,
            name: String,
            obj: {}
        }
    },
    deleted: {type: Boolean, default: false}
});

// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password.main);
};

// create the model for users and expose it to app // Users var
module.exports = mongoose.model('Users', UserSchema);