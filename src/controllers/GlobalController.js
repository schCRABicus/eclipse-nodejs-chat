/**
 * GlobalController. Processes requests tp '/' path;
 * Get and Post mappings are exported to exports.mapping and then are configured in app.js;
 *
 * @module GlobalController
 */

/**
 * Controller mappings
 * @type {Object}
 */
exports.mapping = {
    get : {
        '/' : showMain
    },
    post : {

    }
};

/**
 * Show the main page;
 * This controller is needed to i18nize page;
 *
 * @param req Request object;
 * @param res Response object;
 * @param next  The next function in a chain to be executed for the given request;
 */
function showMain(req, res, next){
    res.render(
        'main.html',
        {

        }
    );
}