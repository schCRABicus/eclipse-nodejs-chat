/**
 * Shows global messages;
 *
 * @module globalMessages
 */
(function(){

	CRABMCE.create('globalMessages', ['event'], function(){

		var
			/**
			 * Class selector for messages;
			 *
			 * @private
			 * @property _classSelector
			 * @type String
			 */
			_classSelector = 'global_message',

			/**
			 * Typical id postfix for all global messages;
			 *
			 * @private
			 * @property _idPostfix
			 * @type String
			 */
			_idPostfix = '_global_message',

			/**
			 * Time to show the message
			 *
			 * @private
			 * @property _delay
			 * @type Number
			 */
			_delay = 5000,

			/**
			 * Default object's height;
			 */
			_defaultHeight = 80,

            /**
             * Event module;
             */
            event,

			/**
			 * Hides message;
			 *
			 * @private
			 * @method _hideMessage
			 * @param {jQuery} m jQuery object, representing DOM element to be hidden;
			 */
			_hideMessage = function(m){
				var id;

				if ( m && m.length ){
					id = m.attr('id');

					m.css('top', -m.outerHeight() || -_defaultHeight); //move element outside viewport
				}
			},

			/**
			 * Hides all messages, which are selected by _classSelector;
			 *
			 * @private
			 * @method _hideMessage
			 */
			_hideAllMessages = function(){
				$("." + _classSelector).each(function(){
					_hideMessage($(this));
				});
			},

			/**
			 * Shows the message with the specified id;
			 *
			 * @method showMessage
			 * @param {String} type Message type
			 * @param {String} header Header title;
			 * @param {String} body Message text;
			 */
			showMessage = function(type, header, body){
				var m = $('#' + type + _idPostfix),
					html = "<h3>" + header + "</h3><p>" + body + "</p>";

		        _hideAllMessages();

				m.html(html);
				m.animate({ top : "0" }, 500);
				m.click(function(){
				    m.animate({top: -m.outerHeight()}, 500);
		        });
				setTimeout(function(){
					m.animate({top: -m.outerHeight()}, 500);
				}, _delay);
			},

			/**
			 * Clears up all global messages;
			 *
			 * @method clear
			 */
			clear = function(){
				$("." + _classSelector).each(function(){
					$(this).empty();
				});
			},

			/**
			 * Initializes plugin
			 */
			init = function(){
                event = CRABMCE.modules.event;
				_hideAllMessages();
                event.addListener("block_hidden" , function(){
                    _hideAllMessages();
                });
			};

		return {
			init : init,
			showMessage : showMessage,
			clear : clear
		}

	});

})();