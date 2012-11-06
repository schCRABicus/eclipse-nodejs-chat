var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	UserDAO = require('./UserDAO.js'),
	Record;

/*
Basic database schema for single record;
 */
var RecordSchema = new Schema({
	date : Date,
	authorId : String,
	record : String
});

mongoose.model('Record', RecordSchema);
Record = mongoose.model('Record');

/**
 * Adds new record to a database, date is set to a current one;
 *
 * @param o  {Object} Record object, containing author's id and record's text;
 * @param cb {Function} Callback to be executed;
 */
exports.create = function(o, cb){
	var newRecord = new Record();

	newRecord.date = new Date();
	newRecord.authorId = o.authorId;
	newRecord.record = o.record;

	newRecord.save(function(err){
		cb(err);
	});
};

/**
 * Reads an entry by id from the database;
 *
 * @param id {Object} Object's identifier to be looked for;
 * @param cb {Function} Callback to be executed on entry being extracted;
 */
var read = exports.read = function(id, cb){
	Record.findOne({_id : id}, function(err, entry){
		if (err){
			cb(err, null);
		} else {
			_addAuthorDependency(entry, function(){
				cb(null, entry)
			});
		}
	});
};

/**
 * Updates the specified object;
 *
 * @param o  {Object} Object to be updated;
 * @param cb {Function} Callback to be executed;
 */
exports.update = function(o, cb){
	o = o || {};

	if(o._id){
		read(o._id, function(err, record){
			if (err){
				cb(err);
			} else {
				record.record = o.record;

				record.save(function(err){
					cb(err);
				});
			}
		});
	}
};

/**
* Deletes the specified object
*
* @param o {Object} Object to be deleted;
* @param cb {Function} Callback to be executed;
*/
exports.del = function(o, cb){
	o = o || {};

	if(o._id){
		read(o._id, function(err, record){
			if (err){
				cb(err);
			} else {
				record.remove();
				cb(null);
			}
		});
	}
};

/**
* Lists all available objects
*
* @param cb {Function} Callback to be executed;
*/
exports.list = function(cb){
	Record.find({}, function(err, entries){
		if (err){
			cb(err, null);
		} else{
			var l = entries.length,
				s = 0,
				_cbCaller;
			entries.forEach(function(entry){
				_addAuthorDependency(entry, function(){
					s++;
				});
			});
			_cbCaller = function(){
				if (s == l){
					cb(null, entries);
				} else{
					setTimeout(_cbCaller, 1);
				}
			};
			_cbCaller();
		}
	});
};

/**
 * Loads author name by its id;
 *
 * @param entry
 * @param cb
 */
var _addAuthorDependency = function(entry, cb){
	UserDAO.read(entry.authorId, function(err, u){
		if (!err && u){
			entry.author = u.login;
		}
		cb();
	});
}