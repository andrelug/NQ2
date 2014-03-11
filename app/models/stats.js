var mongoose = require('mongoose');

var StatsSchema = new mongoose.Schema({
    name: String,
    users: {
        total: Number,
        male: Number,
        female: Number
    }
    
});

module.exports = mongoose.model('Stats', StatsSchema);