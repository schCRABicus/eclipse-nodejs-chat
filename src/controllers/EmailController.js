/**
 * EmailController.
 * Processes all request, connected to email sending;
 * Get and Post mappings are exported to exports.mapping and then are configured in app.js;
 *
 * @module EmailController
 */

/**
 * Dependencies
 * @type {*}
 */
var EmailService = require("../services/EmailService.js");

/**
 * Controller mappings
 * @type {Object}
 */
exports.mapping = {
	get : {

	},
	post : {
		'/sendmail' : processSendmailRequest
	}
};

/**
 * Sends a email by calling the corresponding service (EmailService.sendEmail);
 * If no errors occurred, returns 'ok' status;
 * Otherwise, returns 'fail' status and the user will be informed that mail delivery failed;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function processSendmailRequest(req, res, next){
	var o = {
		name : req.body.name,
		email : req.body.email,
		message : req.body.message
	};

	EmailService.sendEmail(o, function(err, r){
		if (err){
			res.json({
				status : 'fail'
			});
		} else {
			res.json({
				status : 'ok'
			});
		}
	});
}