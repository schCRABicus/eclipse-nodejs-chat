/**
 * AuthController. Processes all request, specified by '/login', '/register', 'logout' paths;
 * Processes all request, connected to authentication operations;
 * Get and Post mappings are exported to exports.mapping and then are configured in app.js;
 *
 * @module AuthController
 */

/**
 * Dependencies
 * @type {*}
 */
var UserService = require('../services/UserService.js'),
    util = require('util');

/**
 * Controller mappings
 * @type {Object}
 */
exports.mapping = {
    get : {
	    '/register/check/login' : processLoginCheck
    },
    post : {
        '/login' : processLogin,
	    '/logout' : processLogout,
	    '/register' : processRegister
    }
};

/**
 * Processes '/login' POST request;
 * This request is sent by a login form;
 * Checks whether the specified user exists via UserService.containsUser method call;
 * If yes, puts the user to the session and sends 'ok' status;
 * Otherwise, sends 'fail' status, which will be interpreted by the page;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
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
		}
    });
}

/**
 * Processes logout request;
 * Removes the user from the current session;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function processLogout(req, res, next){
    req.session.user = null;
	res.json({status : "OK"});
}

/**
 * Processes 'register' request;
 * Checks, whether the specified user exists and if yes, returns 'fail' status, because
 * duplicates and not allowed;
 * Otherwise, adds user to the database;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function processRegister(req, res, next){
	var user = {
		login : req.body.login,
		password : req.body.password
	};

	UserService.containsUser(user, function(r){
	    if (!r.hasUser){
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

/**
 * Processes '/register/check/login' request;
 * This request is sent via ajax on login entering and checks whether the entered login is allowed
 * (checks login presence in a database)
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function processLoginCheck(req, res, next){
	var login = req.query.login;
	UserService.containsLogin(login, function(hasLogin){
		res.json({has : hasLogin});
	});
}