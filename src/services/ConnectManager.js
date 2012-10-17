var mongoose = require('mongoose'),
    dburl = 'mongodb://localhost/nodejs-first-chat';

exports.connect = function(cb){
    mongoose.connect(dburl);
};

exports.disconnect = function(cb){
    mongoose.disconnect(dburl);
};