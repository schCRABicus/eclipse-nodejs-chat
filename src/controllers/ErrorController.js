var util = require('util');
var handlers = exports.handlers = [
    notFoundErrorHandler,
    interalErrorHandler
];

function notFoundErrorHandler(req, res, next){
    //util.log("not found, args = " + util.inspect(arguments));
    res.render(
        'notFound.html',
        {
            path : req.url
        }
    )
}

function interalErrorHandler(err, req, res, next){
    util.log("processing internal error, args = " + util.inspect(arguments));
}