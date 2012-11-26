(function(){

	CRABMCE.create('validator', [], function(){
		//all available validators
		var types = {},

			_messages = [],

			postInit = function(){
				this.types.isNotEmpty = {
					validate : function(value){
						return value != "";
					},
					instructions : 'the value can not be empty'
				};

				this.types.passwordsMatch = {
					validate : function(pwds){
						return pwds.length == 2 && pwds[0] === pwds[1];
					},
					instructions : 'passwords don\'t match'
				};

				this.types.matchPasswordTemplate = {
					validate : function(value){
						var re = /^[A-Za-z0-9_]{6,}$/gi,
							numRE = /\d+/gi,
							symRE = /[A-Za-z]+/gi;

						return re.test(value) && numRE.test(value) && symRE.test(value);
					},
					instructions : 'password has to consist of at least 6 characters, it has to contain symbols and numbers'
				}
			},

			validate = function(data, config){

				var type, checker, res, msg;

				_messages = [];

				for (var i in data){
					if (data.hasOwnProperty(i)){
						type = config[i];
						if (!type){
							continue;
						}
						checker = types[type];
						if (!checker){
							_messages.push({'General' : 'There is no handler to validate ' + type + ' type;'});
							continue;
						}

						res = checker.validate(data[i]);
						if (!res){
							msg = {};
							msg[i] = 'Invalid value for *' + i + '*, ' + checker.instructions;
							_messages.push(msg);
						}
					}
				}

				return hasErrors();
			},

			hasErrors = function(){
				return _messages.length != 0;
			},

			getErrors = function(){
				return _messages;
			};

		return {
			types : types,
			validate : validate,
			hasErrors : hasErrors,
			getErrors : getErrors,
			postInit : postInit
		}

	});

})();