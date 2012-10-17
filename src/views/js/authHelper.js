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
					$.each(params, function(i, item){
						data[item.name] = item.value;
					});

					validator.validate(data, _validationConfig.login);
					if (validator.hasErrors()){
						console.log(validator.getErrors());
					} else {
						$.ajax({
							url : _paths.login,
							type : 'POST',
							dataType : 'json',
							data : data,
							success : function(data){
								console.log('response on login : ', data);
								_redirect(_paths.index);
							},
							error : function(e){
								console.log('error on login : ', e);
							}
						});
					}
				}

		    });
		},

		_redirect = function(destination){
			window.location.href = destination;
		}

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

			    if (_state == _states.ready){
					$.each(params, function(i, item){
						data[item.name] = item.value;
					});
					data.pwds = [data.password, data.cpassword];

					validator.validate(data, _validationConfig.register);
					if (validator.hasErrors()){
						console.log(validator.getErrors());
					} else {
						$.ajax({
							url : _paths.register,
							type : 'POST',
							dataType : 'json',
							data : data,
							success : function(data){
								console.log('response on registration : ', data);
								_redirect(_paths.login);
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
						url : '/register/check/login',
						dataType : 'json',
						data : {
							login : l
						},
						success : function(data){
							console.log(data);
							if (data && data.has){
								_state = _states.error;
							} else {
								_state = _states.ready;
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

		init = function(selectedTab){

			_initTabs();
			_initLoginForm();
			_initRegisterForm();

			if (_selectTab.hasOwnProperty(selectedTab)){
				_selectTab[selectedTab]();
			}
		};

	return {
		init : init
	};
})();