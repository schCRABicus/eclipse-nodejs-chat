var localeHelper = (function($){

	var _selector = null,
		_selectorId = 'selectLocale',
		_default = 'en',
		_supportedLocales = [],

		_changeLocale = function(value){
			if (value){
				$.ajax({
					url : '',
					type : 'GET',
					data : {
						'lang' : value
					},
					success : function(data){
						//location.reload(true);
						document.open();
                        document.write(data);
                        document.close();
					},
					error : function(err){
						console.log('location change failed, the following error occured : ', err);
					}
				});
			}
		},

		init = function(lang){
			_selector = $('#' + _selectorId);

			_selector.children("option").each(function(){
				_supportedLocales.push($(this).val());
			});
			$.inArray(lang, _supportedLocales) != -1 ? _selector.val(lang) : _selector.val(_default);

			_selector.change(function(){
				_changeLocale($(this).val());
			});
		};

	return {
		init : init
	};

})(jQuery);