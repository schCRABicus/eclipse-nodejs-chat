var UserService = require('../services/UserService.js'),
    util = require('util');

exports.mapping = {
    get : { 
        '/login' : renderLoginPage,
	    '/register' : renderRegisterPage,
	    '/register/check/login' : processLoginCheck
    },
    post : {
        '/login' : processLogin,
	    '/register' : processRegister
    }
};

function renderLoginPage(req, res, next){
    res.render(
	    'auth.html',
	    {
			selectedTab : 'login'
	    }
    );
}

function renderRegisterPage(req, res, next){
	res.render(
	    'auth.html',
	    {
			selectedTab : 'register'
	    }
    );
}

function processLogin(req, res, next){
    var user = {
        login : req.body.login,
        password : req.body.password
    };
    UserService.containsUser(user, function(result){
	    if (!result.hasUser){
		    res.json({status : "Fail", message : "Such combination of login/password doesn't exist"});
		} else {
			req.session.user = {_id : result.u._id, login : result.u.login};
		    res.json({status : "OK", message : "You have successfully logged in"});
		    //res.redirect('/index');
		}
    });
}

function processRegister(req, res, next){
	var user = {
		login : req.body.login,
		password : req.body.password
	};
	UserService.containsUser(user, function(hasUser){
	    if (!hasUser){
		    UserService.addUser(user, function(err){
			    if(err){
				    util.log("error on adding user : " + err);
				    res.json({status : "Fail", message : "Error on adding user to database..."});
			    } else{
				    res.json({status : "OK", message : "You have successfully registered"});
			    }
		    });
		} else {
			res.json({status : "Fail", message : "Such user already exists"});
		}
    });
}

function processLoginCheck(req, res, next){
	var login = req.query.login;
	UserService.containsLogin(login, function(hasLogin){
		res.json({has : hasLogin});
	});
}