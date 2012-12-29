/**
 * i18n module;
 * Handles locale switch button click and on change, sends ajax request to get the selected
 * translation; After that, stores it in cache and internalizes page by finding elements,
 * having either 'i18n-value' or 'i18n-html' class;
 *
 * For elements, having 'i18n-value' class, sets localized value;
 * for elements, having 'i18n-html' class, sets localized html content;
 */
(function(){

    CRABMCE.create('locale', ['globalMessages'], function(){

        var

            /**
             * Class string, representing elements, requiring localized value;
             *
             * @property _i18nValueClass
             * @type {String}
             * @private
             */
            _i18nValueClass = 'i18n-value',

            /**
             * Class string, representing elements, requiring localized html content;
             *
             * @property _i18nHtmlClass
             * @type {String}
             * @private
             */
            _i18nHtmlClass = 'i18n-html',

            /**
             * List of supported locales;
             *
             * @property _supportedLocales
             * @type {Array}
             * @private
             */
            _supportedLocales = ['en', 'ru'],

            /**
             * Cached translations;
             *
             * @property _translationsCache
             * @type {Object}
             * @private
             */
            _translationsCache = {},

            /**
             * Global message provider;
             */
            globalMessage,

            /**
             * Locale change handler;
             * Sends ajax request and on success calls for page language update;
             *
             * @param {String} value  New locale, for example, en, ru, etc.;
             */
            _changeLocale = function(value){
                if (value){
                    if ( !_translationsCache.hasOwnProperty(value) ){
                        $.ajax({
                            url : '/locale',
                            type : 'GET',
                            data : {
                                'lng' : value
                            },
                            success : function(data){
                                data = data || {};
                                _translationsCache[value] = data;
                                _localizePage ( _translationsCache[value] );
                            },
                            error : function(err){
                                console.log('location change failed, the following error occured : ', err);
                                globalMessage.showMessage('warning', "Location change failed", "location change failed, the following error occured : " + err.responseText || "");
                            }
                        });
                    } else {
                        _localizePage ( _translationsCache[value] );
                    }
                }
            },

            /**
             * Localizes page by finding elements,
             * having either 'i18n-value' or 'i18n-html' class,
             * and setting them either localized value or localized html content;
             *
             * @method _localizePage
             * @private
             * @param {Object} locale Locale object, having the necessary translations;
             */
            _localizePage = function(locale){
                locale = locale || {};

                $('.' + _i18nValueClass).each(function(){
                    var t = $(this);
                    t.attr('value', locale[t.attr('data-i18n')] || '');
                });

                $('.' + _i18nHtmlClass).each(function(){
                    var t = $(this);
                    t.html(locale[t.attr('data-i18n')] || '');
                });
            },

            /**
             * Initializes locale plugin;
             * Binds event handler on locale change buttons click;
             */
            init = function(){
                globalMessage = CRABMCE.modules.globalMessages;

                $('#locale').find('.locale').click(function(){
                    var lng = $(this).attr('data-value');

                    if ( $.inArray(lng, _supportedLocales) != -1){
                        _changeLocale(lng);
                    }

                });
            };

        return {
            init : init
        };

    });

})();