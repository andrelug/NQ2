// config/database.js
var express = require('express'),
    app = express();

if('development' == app.get('env')) {
    module.exports = {
        'url': process.env.CUSTOMCONNSTR_MONGOLAB_URI
    }
}else{
    module.exports = {
      //  'url': process.env.CUSTOMCONNSTR_MONGOLAB_URI
    }
}