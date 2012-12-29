/**
 * @module ServerStateController Controller to respond to client when server's state is tested;
 */

/**
 * Controller mappings
 * @type {Object}
 */
exports.mapping = {
	get : {
		'/alive' : respond
	},
	post : {

	}
};

/**
 * Sends response to client indicating that server is still running;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function respond(req, res, next) {
	res.json({
		'status' : 'ok'
	});
}