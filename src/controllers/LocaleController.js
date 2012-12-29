/**
 * @module LocaleController Controller to change the locale;
 */

/**
 * Dependencies;
 *
 * @type {*}
 */
var util = require('util'),
    events = require('events'),
    fs = require('fs'),
    localesDir = __dirname.replace('/controllers', '/locales'),
    handler;

/**
 *
 * @constructor
 * @class LocaleHandler
 */
function LocaleHandler(){

}

/**
 * Inheriting EventEmitter to be able to trigger events;
 *
 * @type {Function|EventEmitter}
 */
util.inherits(LocaleHandler, events.EventEmitter);

/**
 * Changes the current locale and sends translation file;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
LocaleHandler.prototype.changeLocale = function(req, res, next){
    var locale = req.query.lng,
        app = req.app,
        file;

    app.emit('localeChanged', req, res, locale);

    file = localesDir + '/translation-' + locale + ".json";
    fs.readFile(file, 'utf8', function(err, data) {
        if (err) {
            res.json({});
        } else {
            res.json(JSON.parse(data));
        }
    });
};

/**
 * Creating instance of locale handler;
 *
 * @type {LocaleHandler}
 */
handler = new LocaleHandler();

/**
 * Controller mappings
 * @type {Object}
 */
exports.mapping = {
    get : {
        '/locale' : handler.changeLocale
    },
    post : {

    }
};