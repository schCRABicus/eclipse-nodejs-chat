(function(){

	CRABMCE.create('event', [], function(){

		var _listeners = {},

			addListener = function(type, cb){
				if ( !_listeners.hasOwnProperty(type) ){
					_listeners[type] = [];
				}
				_listeners[type].push(cb);
			},

			removeListener = function(type, cb){
				var ind;
				if ( _listeners.hasOwnProperty(type) ){
					ind = $.inArray(cb, _listeners[type]);
					if ( ind != -1){
						_listeners[type].splice(ind, 1);
					}
				}
			},

			notifyListeners = function(type){
				var i, l;
				if ( _listeners.hasOwnProperty(type) ){
					for ( i = 0, l = _listeners[type].length; i < l; i++ ){
						_listeners[type][i]();
					}
				}
			};

		return {
			addListener : addListener,
			removeListener : removeListener,
			notifyListeners : notifyListeners
		}

	});

})();