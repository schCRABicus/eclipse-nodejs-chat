/**
 * Data access object to 'Record' schema;
 *
 * @module RecordDao
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Record;

/*
Basic database schema for single record;
 */
var RecordSchema = new Schema({
	date : {
		type: Date,
		'default' : Date.now
	},
	authorId : {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	record : String
});

/**
 * Set up model;
 */
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
	Record
		.findById(id)
		.populate('authorId', 'login')  // only return the User's login
		.exec(function(err, entry){
			if (err){
				cb(err, null);
			} else {
				cb(null, entry);
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
* @method del
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
* @method list
* @param cb {Function} Callback to be executed;
*/
exports.list = function(cb){
	Record
		.find({})
		.populate('authorId', 'login')
		.exec(function(err, entries){
			if (err){
				cb(err, null);
			} else{
				cb(null, entries);
			}
		});
};

/**
 * Lists records of the selected range (by number);
 *
 * @method listRange
 * @param {Number} from        Start range position;
 * @param {Number} to          End range position;
 * @param {Function} cb        Callback to execute;
 */
exports.listRange = function(from, to, cb){
	Record
		.find({'number' : {$gte: from, $lte: to}})
		.populate('authorId', 'login')
		.exec(function(err, entries){
			if (err){
				cb(err, null);
			} else{
				cb(null, entries);
			}
		});
};

/**
 * Lists all records for the selected period
 *
 * @method listRecordsForPeriod
 * @param from  Date to start search from
 * @param cb    Callback to execute;
 */
exports.listRecordsForPeriod = function(from, cb){
	Record
		.where('date').gte(from)
		.populate('authorId', 'login')
		.exec(function(err, entries){
			if (err){
				cb(err, null);
			} else{
				cb(null, entries);
			}
		});
};

exports.listRangeOfRecordsForPeriod = function(from, to, fromRange, cb){
	Record
		.where('date').gte(fromRange)
		.where('number').gte(from).lte(to)
		.populate('authorId', 'login')
		.exec(function(err, entries){
			if (err){
				cb(err, null);
			} else{
				cb(null, entries);
			}
		});
};

/**
 * Counts number of entries in the database;
 *
 * @param conditions {Object} Contitions the target entries have to satisfy
 * @param cb        {Function} Callback to be executed;
 */
exports.count = function(conditions, cb){
	Record.count(conditions, function(err, n){
		if (err){
			cb(err, 0);
		} else{
			cb(null, n);
		}
	});
};