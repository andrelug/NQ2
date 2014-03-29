// config/database.js
var express = require('express'),
    app = express();

if('production' == app.get('env')) {
    module.exports = {
        'url': 'mongodb://localhost/normalquestions'
    }
}else{
    module.exports = {
        'url': process.env.CUSTOMCONNSTR_MONGOLAB_URI
    }
}