(function(){

	CRABMCE.create('authentication', ['validator', 'event', 'globalMessages'], function(){

		//private fields
		var validator,
			menu,
			event,
			globalMessage,
			_paths = {
				index : '/index',
				login : '/login',
				logout : '/logout',
				register : '/register',
				checkLogin : '/register/check/login'
			},
			_states = {
				ready : 0,
				waiting : 1,
				error : 2
			},
			_state = _states.ready,
			_validationConfig = {
				'login' : {
					'login' : 'isNotEmpty',
					'password' : 'isNotEmpty'
				},
				'register' : {
					'login' : 'isNotEmpty',
					'password' : 'matchPasswordTemplate',
					'pwds' : 'passwordsMatch'
				}
			},

			/**
			 * jQuery DOM element, storing ajax-loader for login block;
			 *
			 * @private
			 * @property _ajaxLoaderLogin
			 * @type jQuery
			 */
			_ajaxLoaderLogin,

			/**
			 * jQuery DOM element, storing ajax-loader for register block;
			 *
			 * @private
			 * @property _ajaxLoaderRegister
			 * @type jQuery
			 */
			_ajaxLoaderRegister,

			_authenticatedUser = null,

		//private methods

			/**
			 * Resets form;
			 *
			 * @param form Form to be reset;
			 */
			_resetForm = function(form){
				form.each(function(){
					this.reset();
				});
			},

			/**
			 * Logs current user out and notifies listeners about t;
			 *
			 */
			_logout = function(){
				_authenticatedUser = null;
				event.notifyListeners('authentication');
			},

			/**
			 * @function _initLoginForm
			 * Private initializer;
			 * Initializes login form :
			 *  - binds listener to submit event;
			 *
			 */
			_initLoginForm = function(){
				$('#loginForm').submit(function(){
					var self = $(this),
						params = self.serializeArray(),
						data = {};

					if (_state == _states.ready){
						_clearErrors();
						$.each(params, function(i, item){
							data[item.name] = item.value;
						});

						if ( !_validate( data, 'login' ) ) {
							_ajaxLoaderLogin.show();
							$.ajax({
								url : _paths.login,
								type : 'POST',
								dataType : 'json',
								data : data,
								success : function(rdata){
									if (rdata && rdata.status && rdata.status.toLowerCase() == "ok"){
										_resetForm(self);
										_authenticatedUser = data.login;
										event.notifyListeners('authentication');
										menu.hideTab('login');
									} else {
										rdata = rdata || {};
										globalMessage.showMessage('error', "Login failed", rdata.message || "Something failed");
									}
									_ajaxLoaderLogin.hide();
								},
								error : function(e){
									console.log('error on login : ', e);
									globalMessage.showMessage('warning', "Error on login", e.responseText || "");
									_ajaxLoaderLogin.hide();
								}
							});
						}
					}

				});
			},


			/**
			 * @function _initRegisterForm
			 * Private initializer;
			 * Initializes register form :
			 *  - binds listener to submit event;
			 *  - binds listener to login input field change -
			 *      on change, sends ajax request to check whether such login already exist;
			 */
			_initRegisterForm = function(){

				$('#registerForm').submit(function(){
					var self = $(this),
						params = self.serializeArray(),
						data = {};

					if (_state == _states.ready){
						_clearErrors();
						$.each(params, function(i, item){
							data[item.name] = item.value;
						});
						data.pwds = [data.password, data.cpassword];

						if ( !_validate(data, 'register' )) {
							_ajaxLoaderRegister.show();
							$.ajax({
								url : _paths.register,
								type : 'POST',
								dataType : 'json',
								data : data,
								success : function(data){
									if (data && data.status && data.status.toLowerCase() == "ok"){
										_resetForm(self);
										menu.hideTab('register');
									} else {
										data = data || {};
										globalMessage.showMessage('error', "Registration failed", data.message || "Something failed");
									}
									_ajaxLoaderRegister.hide();
								},
								error : function(e){
									console.log('error on registration : ', e);
									globalMessage.showMessage('error', "Error on registration ", e.responseText || "");
									_ajaxLoaderRegister.hide();
								}
							});
						}
					}

				});

				$('#rlogin').change(function(){
					var l = $(this).val();
					if (l){
						_state = _states.waiting;
						$.ajax({
							url : _paths.checkLogin,
							dataType : 'json',
							data : {
								login : l
							},
							success : function(data){
								console.log(data);
								if (data && data.has){
									_state = _states.error;
									$('#register_loginErrorHolder').text("Such user already exists");
								} else {
									_state = _states.ready;
									$('#register_loginErrorHolder').empty();
								}
							},
							error : function(err){
								console.log("error occured : " + err);
								globalMessage.showMessage('error', "Error occured while checking login existance", err.responseText || "");
								_state = _states.error;
							}
						});
					}
				});

			},

			_initLogoutHandler = function(){
				$('#logout').click(function(){
					$.ajax({
						url : _paths.logout,
						type : 'POST',
						dataType : 'json',
						success : function(data){
							if (data && data.status && data.status.toLowerCase() == "ok"){
								_logout();
								menu.hideTab('logout');
							} else {
								globalMessage.showMessage('error', "Logout failed", data.message || "Something failed");
							}
						},
						error : function(e){      console.log(e);
							globalMessage.showMessage('warning', 'Error on logout', e.responseText || "");
						}
					});

				})
			},

			_validate = function(data, state){
				var hasErrs, k, f, errs, pos, input;

				validator.validate(data, _validationConfig[state]);
				if (hasErrs = validator.hasErrors()){
					errs = validator.getErrors();
					$.each(errs, function(i, err){
						for ( k in err ){
							if (err.hasOwnProperty(k)){
								f = $('#' + state + '_' + k + 'ErrorHolder');
								if (f.length){
									f.text(err[k]);

									input = $('#' + state + 'Form').find('input[name="' + k + '"]');
									pos = $('#' + state + 'Form').find('input[name="' + k + '"]').position();

									f.css({
										left: pos.left + 100 + "px",
										top : pos.top - input.outerHeight() + 20 + "px"
									});

									f.show();
								} else {
									globalMessage.showMessage('error', "Validation error", err[k]);
								}
							}
						}
					});
				}

				return hasErrs;
			},

			_clearErrors = function(){
				$('.errorMessage').each(function(i, item){
					$(item).empty().hide();
				});
				globalMessage.clear();
			},

			isAuthenticated = function(){
				return (_authenticatedUser != null);
			},

			init = function(){
				validator = CRABMCE.modules.validator;
				menu = CRABMCE.modules.circleMenu;
				event = CRABMCE.modules.event;
				globalMessage = CRABMCE.modules.globalMessages;

				_initLoginForm();
				_initRegisterForm();
				_initLogoutHandler();

				_ajaxLoaderLogin = $("#login_ajax_loader");
				_ajaxLoaderRegister = $("#register_ajax_loader");

                event.addListener("hidden_login", function(){
                    _resetForm($('#loginForm'));
                    _clearErrors();
                });
                event.addListener("hidden_register", function(){
                    _resetForm($('#registerForm'));
                    _clearErrors();
                });

				_clearErrors();
			};

		return {
			init : init,
			isAuthenticated : isAuthenticated
		};
	});

})();