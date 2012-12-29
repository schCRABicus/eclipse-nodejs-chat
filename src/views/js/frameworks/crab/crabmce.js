/**
 * Define global namespace to be used in application;
 *
 * @namespace CRABMCE
 */
var CRABMCE = {};

CRABMCE.modules = {};
CRABMCE.stack = [];

/**
 * Static namespace creator;
 * By the given string, creates a new module in 'CRABMCE' namespace and returns the created module;
 *
 * @method namespace
 * @public
 * @param ns_string String representing module name;
 * @return {*}
 */
CRABMCE.namespace = function(ns_string){
	var parts = ns_string.split('.'),
		parent = CRABMCE.modules,
		i, len;

	if (parts && parts[0] === "CRABMCE"){
		parts = parts.slice(1);
	}

	for ( i = 0 , len = parts.length ; i < len ; i++){
		if (typeof parent[parts[i]] === "undefined") {
			parent[parts[i]] = {};
		}

		parent = parent[parts[i]];
	}

	return parent;
};

/**
 * Creates a new module :
 *  - first of all, creates a namespace to be used for module via 'CRABMCE.namespace(ns_string)'
 *      method call;
 *  - then, initializes the module by calling callback function;
 *  - after that, stores dependencies to be loaded for the module;
 *
 * @method create
 * @public
 * @param {String} ns_string   Namespace string;
 * @param {Array} dependencies List of module's dependencies;
 * @param {Function} cb Initialization callback;
 */
CRABMCE.create = function(ns_string, dependencies, cb){
	var m = CRABMCE.namespace(ns_string);
	$.extend(m , cb() );
	m.dependencies = dependencies;
};

/**
 * CRABMCE initialization function;
 * Will be called on page load;
 *
 * First of all, it creates a list of all used dependencies (allDependencies),
 * retrieving the corresponding list for each module's dependencies;
 *
 * Then, loops through all available modules and checks for each dependency whether it's already available;
 * If no, pushes it to 'missedDependencies' list;
 *
 * When the list of all missed dependencies is complete, calls for CRABMCE.loadDependencies function,
 * which asynchronously loads all the dependencies and when all dependencies are loaded,
 * initializes and post initializes each module by calling init() and postInit() methods;
 *
 * @method init
 * @public
 */
CRABMCE.init = function(){
	var allDependencies = [],
		missedDependencies = [],
		module;

	for (module in CRABMCE.modules){
		if (CRABMCE.modules.hasOwnProperty(module)){
			$.each(CRABMCE.modules[module].dependencies, function(i, dependency){
				if ($.inArray(dependency, allDependencies) == -1){
					allDependencies.push(dependency);
				}
			});
		}
	}

	/*
		Have to check whether all dependencies are available, if no, try to load them;
		First of all, remove all dependencies, that are present in modules list;
	 */
	$.each(allDependencies, function(i, dependency){
		if ( !CRABMCE.modules.hasOwnProperty(dependency) ){
			missedDependencies.push(dependency);
		}
	});

	/*
		Now we have only the list of missed dependencies;
		Trying to load them, otherwise, inform;
	 */
	CRABMCE.loadDependencies(missedDependencies, allDependencies, function(){

		for (module in CRABMCE.modules){
			if (CRABMCE.modules.hasOwnProperty(module)){
				if (CRABMCE.modules[module].init && typeof CRABMCE.modules[module].init === "function"){
					CRABMCE.modules[module].init();
				}
				if (CRABMCE.modules[module].postInit && typeof CRABMCE.modules[module].postInit === "function"){
					CRABMCE.modules[module].postInit();
				}
			}
		}
	});

};

/**
 * Loads all the dependencies, specified by 'missedDependencies' list;
 * Searches for it in 'modules' directory and gets the script via $.getScript method call;
 * When the dependency is loaded, checks for it dependencies and adds the absent dependencies to the list;
 * After that, loads the rest mist dependencies;
 *
 * when all libraries are loaded, executes the callback function;
 *
 * @method loadDependencies
 * @public
 * @param {Array} missedDependencies
 * @param {Array} allDependencies
 * @param {Function} cb
 */
CRABMCE.loadDependencies = function(missedDependencies, allDependencies, cb){
	var d;
	if (!missedDependencies || missedDependencies.length == 0){
		if (typeof cb === "function"){
			cb();
		}
	} else{
		d = missedDependencies.pop();
		$.getScript('modules/' + d, function(){
			/*
				Module has been loaded; Have to check its dependencies;
			 */
			$.each(d.dependencies, function(i, dependency){
				if ( !CRABMCE.modules.hasOwnProperty(dependency) && $.inArray(dependency, missedDependencies) == -1){
					missedDependencies.push(dependency);
				}
			});
			CRABMCE.loadDependencies(missedDependencies, allDependencies, cb);
		});
	}
};


jQuery(function(){
	CRABMCE.init();
});