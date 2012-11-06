var dao = require('../dao/RecordDAO.js');

exports.addRecord = function(o, cb){
    dao.create(o, cb);
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

exports.listRecordsFromTo = function(start, end, cb){
	dao.list(function(err, entries){
		if (err){
			cb(err, null);
		} else {
			cb(null, (entries || []).slice(start, end));
		}
	});
};

exports.listTodayRecords = function(cb){
	dao.list(function(err, entries){
		if (err){
			cb(err, null);
		} else {
			var yesterday = new Date(),
				res = [];
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setHours(0);
			yesterday.setMinutes(0);
			yesterday.setSeconds(0);
			res = entries.filter(function(entry){
				return _isRecent(entry.date, yesterday);
			});
			cb(null, res);
		}
	});
};

function _isRecent(date, yestarday){
	return date > yestarday;
}