(function(){

	CRABMCE.create('contact', ['validator', 'event', 'globalMessages'], function(){

		//private fields
		var validator,
			menu,
			event,
			globalMessage,
			_path = '/sendmail',
			_validationConfig = {
				'name' : 'isNotEmpty',
				'email' : 'isEmail',
				'message' : 'isNotEmpty'
			},

			/**
			 * jQuery DOM element, storing ajax-loader
			 *
			 * @private
			 * @property _ajaxLoader
			 * @type jQuery
			 */
			_ajaxLoader,

			/**
			 * Resets form;
			 *
			 * @private
			 * @method _resetForm
			 *
			 * @param form Form to be reset;
			 */
			_resetForm = function(form){
				form.each(function(){
					this.reset();
				});
			},

			/**
			 * @function _initLoginForm
			 * Private initializer;
			 * Initializes contact form :
			 *  - binds listener to submit event;
			 *
			 */
			_initContactForm = function(){
				var _form = $('#contactForm');
				$('#contactMe').click(function(){
					var params = _form.serializeArray(),
						data = {};

					//if (_state == _states.ready){
						_clearErrors();
						$.each(params, function(i, item){
							data[item.name] = item.value;
						});

						if ( !_validate( data ) ) {
							_resetForm(_form);
							_ajaxLoader.show();
							$.ajax({
								url : _path,
								type : 'POST',
								dataType : 'json',
								data : data,
								success : function(rdata){
									if (rdata && rdata.status && rdata.status.toLowerCase() == "ok"){

									} else {
										rdata = rdata || {};
										globalMessage.showMessage('error', "Message sending failed", rdata.message || "Something failed");
									}
									_ajaxLoader.hide();
								},
								error : function(e){
									console.log('error on contact : ', e);
									globalMessage.showMessage('warning', "Error on contact", e.responseText || "");
									_ajaxLoader.hide();
								}
							});
						}
					//}

				});
			},

			_validate = function(data){
				var hasErrs, k, f, errs, pos, input, state="contact";

				validator.validate(data, _validationConfig);
				if (hasErrs = validator.hasErrors()){
					errs = validator.getErrors();
					$.each(errs, function(i, err){
						for ( k in err ){
							if (err.hasOwnProperty(k)){
								f = $('#' + state + '_' + k + 'ErrorHolder');
								if (f.length){
									f.text(err[k]);

									input = $('#contactForm').find('[name="' + k + '"]');
									pos = input.position();

									f.css({
										left: pos.left + 20 + "px",
										top : pos.top - input.outerHeight() + 20 + "px"
									});

									f.show();
								} else {
									//_globalMessageHolder.append(err[k]);
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

			init = function(){
				validator = CRABMCE.modules.validator;
				menu = CRABMCE.modules.circleMenu;
				event = CRABMCE.modules.event;
				globalMessage = CRABMCE.modules.globalMessages;

				_initContactForm();

				_ajaxLoader = $("#contact_ajax_loader");

                event.addListener("hidden_contact", function(){
                    _resetForm($('#contactForm'));
                    _clearErrors();
                });

				_clearErrors();
			};

		return {
			init : init
		};
	});

})();