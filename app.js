//dependencies
var http = require('http'),
	util = require('util'),
	express = require('express'),
	//i18n = require('i18n'),
	i18next = require('i18next'),
	utils = require('./src/utils/utils.js'),
	app = express(),
	store,

	//connect manager
	ConnectManager = require('./src/services/ConnectManager.js'),

	//controllers
	controllers = [
		require('./src/controllers/ChatController.js'), // ChatController
		require('./src/controllers/AuthController.js')  // AuthController
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

/*//configuring i18n module
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'ru'],

	//directory to look for i18n files in
	directory : './src/locales',

    // where to register __() and __n() to, might be "global" if you know what you are doing
    register: global
});*/

i18next.init({
	//directory to look for i18n files in
	resGetPath: './src/locales/__ns__-__lng__.json',
	detectLngQS: 'lang',
	useLocalStorage: true,
	localStorageExpirationTime: 365*24*60*60*1000, // (one year) in ms, default 1 week
	debug: false//true
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

http.createServer(app).listen(http_port);
