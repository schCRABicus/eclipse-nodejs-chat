//dependencies
var http = require('http'),
	util = require('util'),
	express = require('express'),
	i18next = require('i18next'),
	utils = require('./src/utils/utils.js'),
	app = express(),
	store,

	//connect manager
	ConnectManager = require('./src/services/ConnectManager.js'),

	//controllers
	controllers = [
		require('./src/controllers/ChatController.js'), // ChatController
		require('./src/controllers/AuthController.js'), // AuthController
		require('./src/controllers/ServerStateController.js'), //ServerStateController.js
		require('./src/controllers/EmailController.js'), //EmailController.js,
        require('./src/controllers/GlobalController.js'),//GlobalController.js
        require('./src/controllers/LocaleController.js') //LocaleController.js
	],
	ErrorController = require('./src/controllers/ErrorController.js'),

	//filters
	filters = [
		require('./src/filters/AuthFilter.js')         // AuthFilter
	],

	//mapping
	mapping = {
	   get:{}, 
	   post:{}
	},
	filterMapping = {
		get:{},
		post:{}
	},
	key,
	http_port = 8124; //port to listen to


app.use(express.bodyParser());     //body parser to process post requests
app.use(express.cookieParser());

//configuring session - initializing MemoryStore and binding express.session
store = new express.session.MemoryStore;
app.use(express.session({
    store : store,
    secret : 'very-hard-secret-key'
}));

//setting path to resolve static references from web pages;
app.use(express.static('src/views'));

//configuring i18n module
i18next.init({
	//directory to look for i18n files in
	resGetPath: './src/locales/__ns__-__lng__.json',
	detectLngQS: 'lang',
	useLocalStorage: true,
    returnObjectTrees: true,
	localStorageExpirationTime: 365*24*60*60*1000, // (one year) in ms, default 1 week
	debug: false
});

app.configure(function(){
    // configuring view engine
	app.engine('html', require('ejs').renderFile);
	app.set('views', __dirname + '/src/views');
	app.set('view engine', 'ejs');

	// using 'accept-language' header to guess language settings
    //app.use(i18n.init);
	app.use(i18next.handle);
	app.use(app.router);

	app.use(express.favicon(__dirname + '/src/views/favicon.png'));
	app.use(express.logger());
	app.use(express.errorHandler({ dumpExceptions: true }));

});
i18next.registerAppHelper(app);
controllers.forEach(function(controller){
	utils.extend(mapping.get, controller.mapping.get);
	utils.extend(mapping.post, controller.mapping.post);
});
filters.forEach(function(filter){
	utils.extend(filterMapping.get, filter.mapping.get);
	utils.extend(filterMapping.post, filter.mapping.post);
});
for ( key in mapping.get ){
    if (mapping.get.hasOwnProperty(key)){
        app.get(key, filterMapping.get[key] || utils.noop, mapping.get[key]);
    }
} 
for ( key in mapping.post){
    if (mapping.post.hasOwnProperty(key)){
        app.post(key, filterMapping.post[key] || utils.noop, mapping.post[key]);
    }
}

//binding error controllers
ErrorController.handlers.forEach(function(errorHandler){
    app.use(errorHandler);
});

//establishing connection to a database via ConnectManager
ConnectManager.connect();
app.on('close', function(err){
    ConnectManager.disconnect(function(err){});
});

//locale change handler;
app.on('localeChanged', function(req, res, locale){
    var t, i18nDummy;

    // set locale & i18n in req
    req.locale = req.lng = req.language = locale;

    // assert t function returns always translation
    // in given lng inside this request
    t = function(key, options) {
        options = options || {};
        options.lng = options.lng || req.lng || i18next.lng();
        return i18next.t(key, options);
    };

    i18nDummy = {
        t: t,
        translate: t,
        lng: function() { return locale; },
        locale: function() { return locale; },
        language: function() { return locale; }
    };

    // assert for req
    req.i18n = i18nDummy;
    req.t = req.t || t;

    // assert for res -> template
    if (res.locals) {
        res.locals.t = t;
        res.locals.i18n = i18next;
    }

    i18next.setLng(locale, function() {
        i18next.persistCookie(req, res, i18next.lng());
    });
});

http.createServer(app).listen(http_port);
