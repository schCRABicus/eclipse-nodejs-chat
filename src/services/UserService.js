var dao = require('../dao/UserDAO.js');

exports.connect = function(cb){
    dao.connect(cb);
};

exports.addUser = function(o, cb){
    dao.create(o, cb);
};

exports.getUser = function(id, cb){
    dao.read(id, cb);
};

exports.removeUser = function(o, cb){
    dao.del(o, cb);
};

var listAllUsers = exports.listAllUsers = function(cb){
    dao.list(cb);
};

var listAllLogins = exports.listAllLogins = function(cb){
	listAllUsers(function(err, entries){
		if (err){
			cb(err, null);
		} else{
			var list = entries.map(function(entry){
				return entry.login;
			});
			cb(null, list);
		}
	});
};

exports.containsUser = function(o, cb){
    var hasUser = false;
    if (o){
        dao.list(function(err, entries){
            if (err){
                cb(false);
            }
            entries.forEach(function(u){
                if (u.login == o.login && u.password == o.password){
                    hasUser = true;
                }
            });
	        cb(hasUser);
        }); 
    }

};

exports.containsLogin = function(login, cb){
	var hasLogin = false;
	listAllLogins(function(err, list){
		if (err){
			cb(false);
		} else {
			list.forEach(function(l){
				if (l == login){
					hasLogin = true;
				}
			});
			cb(hasLogin);
		}
	});
}