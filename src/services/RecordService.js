var dao = require('../dao/RecordDAO.js');

exports.addRecord = function(o, cb){
    dao.create(o, function(err){
	    cb(err);
    });
};

exports.getRecord = function(id, cb){
    dao.read(id, cb);
};

exports.removeRecord = function(o, cb){
    dao.del(o, cb);
};

exports.listAllRecords = function(cb){
    dao.list(cb);
};

exports.listAllRecordsFromTo = function(start, end, cb){
	start = start - 1;
	dao.list(function(err, entries){
		if (err){
			cb(err, null);
		} else {
			cb(null, (entries || []).slice( Math.max( start , 0) , Math.min( end, entries.length ) ));
		}
	});
};

exports.listAllLastRecordsFromTo = function(num, cb){
	dao.list(function(err, entries){
		if (err){
			cb(err, null);
		} else {
			cb(null, (entries || []).slice( Math.max( entries.length - num , 0) , entries.length));
		}
	});
};

/**
 * Lists all recent records;
 *
 * @param cb Callback function to be executed
 */
var _listTodayRecords = exports.listTodayRecords = function(cb){

	dao.listRecordsForPeriod(getYesterday(), function(err, entries){
		if (err){
			cb(err, null);
		} else {
			cb(null, entries);
		}
	});
};

/**
 * Returns list of the records of the specified range;
 *
 * @param start Number to start the range
 * @param end   Number to end the range
 * @param cb    Callback function to be executed
 */
exports.listTodayRecordsFromTo = function(start, end, cb){
	start = start - 1;
	_listTodayRecords(function(err, entries){
		if (err){
			cb(err, null);
		} else {
			//entries = entries.toObject();
			/*if (start >= 0 && start < entries.length){
				entries = entries.splice(0, start);
			}
			if (end + 1 > start && end + 1 - start < entries.length){
				entries = entries.splice(end - start + 1, entries.length - end + start - 1);
			}
			cb(null, entries);*/
			cb(null, (entries || []).slice( Math.max( start , 0) , Math.min( end, entries.length ) ));
		}
	});
};

/**
 * Returns list of the records of the specified range;
 *
 * @param num   Number of entries to return
 * @param cb    Callback function to be executed
 */
exports.listTodayLastRecordsFromTo = function(num, cb){
	_listTodayRecords(function(err, entries){
		if (err){
			cb(err, null);
		} else {
			//entries = entries.toObject();
			/*start = entries.length - end;
			end = entries.length - start;

			if (start >= 0 && start < entries.length){
				entries = entries.splice(0, start);
			}
			if (end + 1 > start && end + 1 - start < entries.length){
				entries = entries.splice(end - start + 1, entries.length - end + start - 1);
			}*/
			entries = (entries || []).slice( Math.max( entries.length - num, 0) , entries.length);
			cb(null, entries);
		}
	});
};

/**
 * Counts number of all entries in the database;
 *
 * @param cb   Callback function to be executed
 */
exports.countAllRecords = function(cb){
	dao.count( {}, function(err, n){
		cb(err, n);
	});
};

/**
 * Counts number of recent entries in the database;
 *
 * @param cb   Callback function to be executed
 */
exports.countTodayRecords = function(cb){
	_listTodayRecords(function(err, entries){
		if (err){
			cb(err, 0);
		} else{
			cb(null, entries.length);
		}
	});
};

/**
 * Lists all records for the specified period ;
 *
 * @param periodType  Type of period (day, month, year)
 * @param number      Number of days ago
 * @param cb Callback function to be executed
 */
var _listRecordsForPeriod = exports.listRecordsForPeriod = function(periodType, number, cb){

	dao.listRecordsForPeriod(getPeriodStart(periodType, number), function(err, entries){
		if (err){
			cb(err, null);
		} else {
			cb(null, entries);
		}
	});
};

/**
 * Returns list of the records for the specified period of the specified range;
 *
 * @param periodType  Type of period (day, month, year)
 * @param number      Number of days ago
 * @param start Number to start the range
 * @param end   Number to end the range
 * @param cb    Callback function to be executed
 */
exports.listRecordsForPeriodFromTo = function(periodType, number, start, end, cb){
	start = start - 1;
	_listRecordsForPeriod(periodType, number, function(err, entries){
		if (err){
			cb(err, null);
		} else {
			//entries = entries.toObject();
			/*if (start >= 0 && start < entries.length){
				entries = entries.splice(0, start);
			}
			if (end + 1 > start && end + 1 - start < entries.length){
				entries = entries.splice(end - start + 1, entries.length - end + start - 1);
			}
			cb(null, entries);*/
			cb(null, (entries || []).slice( Math.max(start, 0), Math.min(end, entries.length) ) ) ;
		}
	});
};

/**
 * Returns list of the records for the specified period of the specified range;
 *
 * @param periodType  Type of period (day, month, year)
 * @param number      Number of days ago
 * @param num   Number of entries to return
 * @param cb    Callback function to be executed
 */
exports.listRecordsForPeriodLastFromTo = function(periodType, number, num, cb){
	_listRecordsForPeriod(periodType, number, function(err, entries){
		if (err){
			cb(err, null);
		} else {
			//entries = entries.toObject();
			/*start = entries.length - end;
			end = entries.length - start;

			if (start >= 0 && start < entries.length){
				entries = entries.splice(0, start);
			}
			if (end + 1 > start && end + 1 - start < entries.length){
				entries = entries.splice(end - start + 1, entries.length - end + start - 1);
			}*/
			entries = (entries || []).slice(Math.max(entries.length - num, 0) , entries.length);
			cb(null, entries);
		}
	});
};

/**
 * Counts number of entries for the specified period in the database;
 *
 * @param periodType  Type of period (day, month, year)
 * @param number      Number of days ago
 * @param cb   Callback function to be executed
 */
exports.countRecordsForPeriod = function(periodType, number, cb){
	_listRecordsForPeriod(periodType, number, function(err, entries){
		if (err){
			cb(err, 0);
		} else{
			cb(null, entries.length);
		}
	});
};

function _isRecent(date, yestarday){
	return date > yestarday;
}

/**
 * Gets yesterday date from from 0:00 hours;
 *
 * @return yesterday date from from 0:00 hours;
 */
function getYesterday(){
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	yesterday.setHours(0);
	yesterday.setMinutes(0);
	yesterday.setSeconds(0);

	return yesterday;
}

/**
 * Gets a start date for the specified period
 *
 * @param periodType  Type of period (day, month, year)
 * @param number      Number of days ago
 * @return start date for the specified period
 */
function getPeriodStart(periodType, number){
	var now = new Date(),
		res = new Date(), shift;

	switch (periodType){

		case 'day' :
			shift = number;
			break;

		case 'month' :
			shift = number *30;
			break;

		case 'year' :
			shift = number * 365;
			break;

		default :
			number = 0;

	}

	res.setDate(now.getDate() - shift);
	res.setHours(0);
	res.setMinutes(0);
	res.setSeconds(0);
	//console.log("period start for periodType = " + periodType + " and number = " + number + " is " + res);
	return res;
}