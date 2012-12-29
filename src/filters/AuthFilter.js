/**
 * Filters requests to protected paths and checks authentication;
 * If the user is not authenticated, denies access to the page;
 *
 * @module AuthFilter
 */

/**
 * Mappings handled by the filter;
 *
 * @type {Object}
 */
var mapping = exports.mapping = {
	get : {
		'/chat/wait' : checkAuthentication
	},
	post : {
       '/chat/add' : checkAuthentication
    }
};

/**
 * Checks whether the user is authenticated and if no, redirects to the main page;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function checkAuthentication(req, res, next){
	var session = req.session,
		user = null;

	if (session){
		user = session.user;
	}
	if (user){
		next();
	} else{
		res.redirect('/');
	}
}