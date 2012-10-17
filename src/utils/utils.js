/**
*   Copies properties of source object to target object;
*/
exports.extend = function(target, source){
    for (var key in source){
        if (source.hasOwnProperty(key)){
            target[key] = source[key];
        }
    }
};

exports.noop = function(req, res, next){
	if (typeof next === "function"){
		next();
	}
};