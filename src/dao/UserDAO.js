var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    User;

/**
* Basic database schema for user record;
*/ 
var UserSchema = new Schema({
   login : String,
   password : String 
});

mongoose.model('User', UserSchema);
User = mongoose.model('User');

/**
* Adds new record to database
* 
* @param o {Object} Object to be created;
* @param cb {Function} Callback to be executed;
*/
exports.create = function(o, cb){
    var newUser = new User();
    
    newUser.login = o.login;
    newUser.password = o.password;
    
    newUser.save(function(err){
        cb(err);
    });
};

/**
* Gets all records by the specified id;
*
* @param id Id to search for;
* @param cb {Function} Callback to be executed;
*/
exports.read = function(id, cb){
    User.findOne({_id : id}, function(err, entry){
        if (err){
            cb(err, null);
        } else {
            cb(null, entry);
        }
    });
};

/**
* Updates the specified object
* 
* @param o {Object} Object to be updated;
* @param cb {Function} Callback to be executed;
*/
exports.update = function(o, cb){
    User.findOne({_id : o._id}, function(err, entry){
        if (err){
            cb(err);
        } else{
            entry.login = o.login;
            entry.password = o.password;
            
            entry.save(function(err){
                cb(err);
            });
        }
    });
};

/**
* Deletes the specified object
* 
* @param o {Object} Object to be deleted;
* @param cb {Function} Callback to be executed;
*/
exports.del = function(o, cb){
    User.findOne({_id : o._id}, function(err, entry){
        if (err){
            cb(err);
        } else{
            entry.remove();
            cb(null);
        }
    });
};

/**
* Lists all available objects
* 
* @param cb {Function} Callback to be executed;
*/
exports.list = function(cb){
    User.find({}, function(err, entries){
        if (err){
            cb(err, null);
        } else {
            cb(null, entries);
        }
    });
};
