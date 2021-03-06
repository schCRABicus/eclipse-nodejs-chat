var mongoose = require('mongoose'),
    dburl = process.env.MONGOLAB_URI || 'mongodb://localhost/nodejs-first-chat';

/**
* Connects to a database
*/
exports.connect = function(){
    mongoose.connect(dburl);
};

/**
* Disconnects from the database
* @param cb {Function} Callback to be executed;
*/
exports.disconnect = function(cb){
    mongoose.disconnect(cb);
};