/**
 * ErrorController.
 * Handles all errors and shows the appropriate page to use;
 *
 * @module ErrorController
 */

/**
 * Dependencies
 * @type {*}
 */
var util = require('util');

var handlers = exports.handlers = [
    notFoundErrorHandler,
    interalErrorHandler
];

/**
 * Shows not founds error page, when no mapping is found for the request's path;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function notFoundErrorHandler(req, res, next){
    res.render(
        'notFound.html',
        {
            path : req.url
        }
    );
}

/**
 * Notifies about internal errors;
 *
 * @param err The error occurred;
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function interalErrorHandler(err, req, res, next){
    util.log("processing internal error, args = " + util.inspect(arguments));
    res.render(
        'notFound.html',
        {
            path : req.url
        }
    );
}