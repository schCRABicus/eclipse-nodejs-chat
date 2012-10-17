//dependencies
var http = require('http'),
	util = require('util'),
	express = require('express'),
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

app.configure(function(){
    // configuring view engine
	app.engine('html', require('ejs').renderFile);
	app.set('views', __dirname + '/src/views');
	app.set('view engine', 'ejs');
	
	app.use(app.router);
	
	app.use(express.logger());
	app.use(express.errorHandler({ dumpExceptions: true }));

});

controllers.forEach(function(controller){
	utils.extend(mapping.get, controller.mapping.get);
	utils.extend(mapping.post, controller.mapping.post);
});
filters.forEach(function(filter){
	utils.extend(filterMapping.get, filter.mapping.get);
	utils.extend(filterMapping.post, filter.mapping.post);
});
for (var key in mapping.get){
    if (mapping.get.hasOwnProperty(key)){
        app.get(key, filterMapping.get[key] || utils.noop, mapping.get[key]);
    }
} 
for (var key in mapping.post){
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
