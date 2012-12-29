/**
 * ChatController. Processes all request, specified by '/chat' path;
 * Get and Post mappings are exported to exports.mapping and then are configured in app.js;
 *
 * @module ChatController
 */

/**
 * Dependencies
 * @type {*}
 */
var util = require('util'),
	RecordService = require('../services/RecordService.js'),

	// array of listeners, who are waiting for chat messages;
	listeners = [];

/**
 * Controller mappings;
 *
 * @type {Object}
 */
exports.mapping = {
    get : {
        '/index' : showMain,
	    '/chat/records/recent' : getRecentRecords,
	    '/chat/records/recent/range' : getRecentRecordsFromTo,
	    '/chat/records/recent/count' : getRecentRecordsCount,
	    '/chat/records/recent/last' : getRecentRecordsLast,
	    '/chat/records/all' : getAllRecords,
	    '/chat/records/all/range' : getAllRecordsFromTo,
	    '/chat/records/all/count' : getAllRecordsCount,
	    '/chat/records/all/last' : getAllRecordsLast,
	    '/chat/records/period' : getPeriodRecords,
	    '/chat/records/period/range' : getPeriodRecordsFromTo,
	    '/chat/records/period/count' : getPeriodRecordsCount,
	    '/chat/records/period/last' : getPeriodRecordsLast,
	    '/chat/wait' : addListener
    },
    post : {
        '/chat/add' : addRecord
    }
};

/**
 * Shows main page and puts currently logged in user;
 *
 * @param req Request object;
 * @param res Response object;
 */
function showMain(req, res){
	res.render(
		'index.html',
		{
			user : req.session.user.login
		}
	);
}

/**
 * Shows records for the past two days (today and yesterday)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getRecentRecords(req, res){
	RecordService.listTodayRecords(function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the specified range of records for the past two days (today and yesterday)
 * Range bounds (from/to) are extracted from request parameters (req.query.from / req.query.to)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getRecentRecordsFromTo(req, res){
	var s = req.query.from,
		e = req.query.to;

	RecordService.listTodayRecordsFromTo(s, e, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the last 'n' records for the past two days (today and yesterday)
 * Range bound (to) is extracted from request parameters (req.query.to)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getRecentRecordsLast(req, res){
	var n = req.query.to;

	RecordService.listTodayLastRecordsFromTo(n, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the total number of the records for the past two days;
 * Returns number in json format { number : n };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getRecentRecordsCount(req, res){
	RecordService.countTodayRecords(function(err, n){
		res.json(
			{
				number : n
			}
		);
	});
}

/**
 * Gets the list of all records;
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getAllRecords(req, res){
	RecordService.listAllRecords(function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the specified range of all records;
 * Range bounds (from/to) are extracted from request parameters (req.query.from / req.query.to)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getAllRecordsFromTo(req, res){
	var s = req.query.from,
		e = req.query.to;

	RecordService.listAllRecordsFromTo(s, e, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the last 'n' records of all available records;
 * Range bound (to) is extracted from request parameters (req.query.to)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getAllRecordsLast(req, res){
	var n = req.query.to;

	RecordService.listAllLastRecordsFromTo(n, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the total number of all records;
 * Returns number in json format { number : n };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getAllRecordsCount(req, res){
	RecordService.countAllRecords(function(err, n){
		res.json(
			{
				number : n
			}
		);
	});
}

/**
 * Gets the list of all records for the specified period;
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getPeriodRecords(req, res){
	var pt = req.query.period,
		n = req.query.number;

	RecordService.listRecordsForPeriod(pt, n, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the specified range of all records for the specified period;
 * Range bounds (from/to) are extracted from request parameters (req.query.from / req.query.to)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getPeriodRecordsFromTo(req, res){
	var s = req.query.from,
		e = req.query.to,
		pt = req.query.period,
		n = req.query.number;

	RecordService.listRecordsForPeriodFromTo(pt, n, s, e, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the last 'n' records of all available records for the specified period;
 * Range bound (to) is extracted from request parameters (req.query.to)
 * Returns records in json format { records : records };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getPeriodRecordsLast(req, res){
	var pt = req.query.period,
		n = req.query.number,
		nn = req.query.to;

	RecordService.listRecordsForPeriodLastFromTo(pt, n, nn, function(err, records){
		res.json(
			{
				records : records
			}
		);
	});
}

/**
 * Gets the total number of all records for the specified period;
 * Returns number in json format { number : n };
 *
 * @param req Request object;
 * @param res Response object;
 */
function getPeriodRecordsCount(req, res){
	var pt = req.query.period,
		nm = req.query.number;

	RecordService.countRecordsForPeriod(pt, nm, function(err, n){
		res.json(
			{
				number : n
			}
		);
	});
}

/**
 * Processes POST request, so, records is extracted from req.body object;
 * Tries to add the record to the database;
 * If the record was added without any errors, then notifies listeners about message adding;
 * If no, sends 'fail' status to message sender;
 *
 * @param req Request object;
 * @param res Response object;
 */
function addRecord(req, res){
	var record = {
		date : new Date(),
		record : req.body.record,
		authorId : req.session.user._id
	};

	RecordService.addRecord(record, function(err){
		if (!err){
			_informListeners({
					date : record.date,
					record : record.record,
					authorId : {
						login : record.authorId
					}
				});
			res.json({status : "ok" });
		} else {
			res.json({status : "fail" });
		}
	});
}

/**
 * Registers new listener;
 * When the ,essage is added, all the available listeners are informed;
 *
 * @param req Request object;
 * @param res Response object;
 */
function addListener(req, res){
	listeners.push(function(record){
		res.json(record);
	});
}

/**
 * Informs listeners about message adding by sending them the added record;
 *
 * @param record Last added record;
 * @private
 */
function _informListeners(record){
	var o = {status : "ok", record : record};
	while (listeners.length){
		listeners.shift()(o);
	}
}