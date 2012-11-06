var authHelper = (function(){
	//private fields
	var _paths = {
			index : '/index',
			login : '/login',
			register : '/register',
			checkLogin : '/register/check/login'
		},
		_tabs = {},
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
		_globalMessageHolder,

	//private methods
		_initTabs = function(){
			var t;
			$("#menuList li").each(function(i, el){
				t = $(el).find("span").attr('class');
				_tabs[t] = $("#" + t + "Tab");
			});
		},

		_selectTab = {
			login : function(){
				$('#registerTab').hide();
				$('#loginTab').show();
			},
			register : function(){
				$('#loginTab').hide();
				$('#registerTab').show();


			}
		},

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
						$.ajax({
							url : _paths.login,
							type : 'POST',
							dataType : 'json',
							data : data,
							success : function(data){
								if (data && data.status && data.status.toLowerCase() == "ok"){
									_redirect(_paths.index);
								} else {
									data = data || {};
									_globalMessageHolder.append(data.message || "Something failed");
								}
							},
							error : function(e){
								console.log('error on login : ', e);
							}
						});
					}
				}

		    });
		},


		/**
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
				console.log(_state);
			    if (_state == _states.ready){
				    _clearErrors();
					$.each(params, function(i, item){
						data[item.name] = item.value;
					});
					data.pwds = [data.password, data.cpassword];

					if ( !_validate(data, 'register' )) {
						$.ajax({
							url : _paths.register,
							type : 'POST',
							dataType : 'json',
							data : data,
							success : function(data){
								if (data && data.status && data.status.toLowerCase() == "ok"){
									_redirect(_paths.login);
								} else {
									data = data || {};
									_globalMessageHolder.append(data.message || "Something failed");
								}
							},
							error : function(e){
								console.log('error on registration : ', e);
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
							_state = _states.error;
						}
					});
				}
			});

		},

		_validate = function(data, state){
			var hasErrs, k, f, errs;

			validator.validate(data, _validationConfig[state]);
			if (hasErrs = validator.hasErrors()){
				errs = validator.getErrors();
				$.each(errs, function(i, err){
					for ( k in err ){
						if (err.hasOwnProperty(k)){
							f = $('#' + state + '_' + k + 'ErrorHolder');
							if (f.length){
								f.text(err[k]);
							} else {
								_globalMessageHolder.append(err[k]);
							}
						}
					}
				});
			}

			return hasErrs;
		},

		_clearErrors = function(){
			$('.errorMessage').each(function(i, item){
				$(item).empty();
			});
			_globalMessageHolder.empty();
		},

		_redirect = function(destination){
			window.location.href = destination;
		},

		init = function(selectedTab){

			_initTabs();
			_initLoginForm();
			_initRegisterForm();

			_globalMessageHolder = $("#globalMessageHolder");

			if (_selectTab.hasOwnProperty(selectedTab)){
				_selectTab[selectedTab]();
			}
		};

	return {
		init : init
	};
})();