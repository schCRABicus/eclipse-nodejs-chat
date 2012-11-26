var CRABMCE = {};

CRABMCE.modules = {};
CRABMCE.stack = [];

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

CRABMCE.create = function(ns_string, dependencies, cb){
	var m = CRABMCE.namespace(ns_string);
	$.extend(m , cb() );
	m.dependencies = dependencies;

	/*CRABMCE.stack.push({
		name : ns_string,
		dependencies : dependencies,
		cb : cb
	});*/
};

CRABMCE.init = function(){
	var allDependencies = [],
		missedDependencies = [],
		module, modules = [];

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

		/*// now all modules are available, can initialize them;
		$.each(CRABMCE.stack, function(i, module){
			$.extend( CRABMCE.namespace(module.name) , module.cb() );
		});*/


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