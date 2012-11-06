var CRABMCE = {};

CRABMCE.namespace = function(ns_string){
	var parts = ns_string.split('.'),
		parent = CRABMCE,
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

CRABMCE.create = function(ns_string, obj){
	var m = CRABMCE.namespace(ns_string);
	m = obj;
};