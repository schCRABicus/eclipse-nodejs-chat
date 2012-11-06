var util = require('util'),
	RecordService = require('../services/RecordService.js'),

	// array of listeners, who are waiting for chat messages;
	listeners = [];

exports.mapping = {
    get : {
       '/index' : showMain,
	   '/chat/wait' : addListener
    },
    post : {
       '/chat/add' : addRecord
    }
};

function showMain(req, res){
	//RecordService.listRecordsFromTo(0, 10, function(err, records){
	RecordService.listTodayRecords(function(err, records){
		//util.log(util.inspect(records));
		res.render(
			'index.html',
			{
				user : req.session.user.login,
				records : records
			}
		);
	});
}

function addRecord(req, res){
	var record = {
		date : new Date(),
		record : req.body.record,
		authorId : req.session.user._id
	};

	RecordService.addRecord(record, function(err){
		if (!err){
			_informListeners({date : record.date, record : record.record, author : req.session.user.login});
		} else {
			res.json({status : "fail"});
		}
	});
}

function addListener(req, res){
	listeners.push(function(record){
		res.json(record);
	});
}

function _informListeners(record){
	var o = {status : "ok", record : record};
	while (listeners.length){
		listeners.shift()(o);
	}
}