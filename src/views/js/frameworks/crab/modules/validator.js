/**
 * Provides validator to validate input's values;
 * Implements strategy pattern, when the proper validation strategy is selected for the specified field type;
 *
 * @module validator
 */
(function(){

	CRABMCE.create('validator', [], function(){

		//all available validators
		var types = {},

			_messages = [],

            /**
             * Post initialize functions;
             *
             * Adds supported strategies to validator;
             */
			postInit = function(){

                /**
                 * Checks for non empty value;
                 *
                 * @type {{validate: Function, instructions: string}}
                 */
				this.types.isNotEmpty = {
					validate : function(value){
						return value != "";
					},
					instructions : 'the value can not be empty'
				};

                /**
                 * Validates email string;
                 *
                 * @type {{validate: Function, instructions: string}}
                 */
				this.types.isEmail = {
					validate : function(value){
						var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return re.test(value);
					},
					instructions : 'the value is not a valid email address'
				};

                /**
                 * Checks passwords matching;
                 * @type {{validate: Function, instructions: string}}
                 */
				this.types.passwordsMatch = {
					validate : function(pwds){
						return pwds.length == 2 && pwds[0] === pwds[1];
					},
					instructions : 'passwords don\'t match'
				};

                /**
                 * Checks matching to password template;
                 *
                 * @type {{validate: Function, instructions: string}}
                 */
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

            /**
             * Validates the specified data with the specified configuration;
             *
             * @method  validate
             * @public
             * @param {Object} data  Data to be validated
             * @param {Object} config Configuration, specifying the validator type for each data field;
             */
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

            /**
             * Returns true if errors occurred during the last validation and false otherwise;
             *
             * @method hasErrors
             * @public
             * @return {Boolean} Returns true if errors occurred during the last validation and false otherwise;
             */
			hasErrors = function(){
				return _messages.length != 0;
			},

            /**
             * Gets the list of all errors;
             *
             * @method getErrors
             * @public
             * @return {Array} Gets the list of all errors;
             */
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