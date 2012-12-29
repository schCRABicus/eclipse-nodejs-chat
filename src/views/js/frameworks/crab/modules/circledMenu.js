/**
 * Circled menu plugin;
 * The navigation menu consists of circles, which are rotated on hover;
 * On circle click, the specified page is opened;
 * Fade effect is used to show/hide menu and pages;
 *
 *  @module circledMenu
 */
(function(){

	CRABMCE.create('circleMenu', ['event', 'authentication'], function(){

		var $ = jQuery,

            /**
             * Event module to listen to and to notify listeners about events;
             *
             * @property event
             */
            event,

            /**
             * Authentication module to check user authentication;
             *
             * @property auth
             */
            auth,

            /**
             * Fade duration
             *
             * @property _fade_duration
             * @private
             * @type {Number}
             */
			_fade_duration = 500,

            /**
             * Currently selected page;
             *
             * @property _selected_tab
             * @private
             * @type {String}
             */
			_selected_tab = "",

            /**
             * List of menu items
             *
             * @property _menu_items
             * @private
             * @type {jQuery}
             */
			_menu_items = $([]),

            /**
             * Current navigation menu type (depends on user authentication
             *
             * @property _current_menu
             * @private
             * @type {String}
             */
			_current_menu = 'unlogged',

			_fade_in_block = function(tab, cb){
				$( ".block." + tab ).fadeIn( _fade_duration, cb );
			},

			_fade_out_block = function(tab, cb){
				$( ".block." + tab ).fadeOut( _fade_duration, cb );
			},

			_fade_in_items = function(items){
				var l = items.length,
					i = 0,
					cb = function(){
						if ( ++i == l ){
							$(".menu-cont." + _current_menu).show();
						}
					}

				$(items).fadeIn(_fade_duration, cb);
			},

			_fade_out_items = function(items){
				var l = items.length,
					i = 0,
					cb = function(){
						if ( ++i == l ){
							$(".menu-cont." + _current_menu).hide();
							_fade_in_block(_selected_tab, function(){
								event.notifyListeners('showed_' + _selected_tab);
							});
						}
					};

				$(items).fadeOut(_fade_duration, cb);
			},

            /**
             * Initializes rotate effect by binding the corresponding
             * handler to all elements, having 'rot' class and followed by image element;
             *
             * @method _init_rotate_effect
             * @private
             */
			_init_rotate_effect = function(){
				$(".rot img").rotate({
				   bind:
					 {
						mouseover : function() {
							$(this).rotate({animateTo:360})
						},
						mouseout : function() {
							$(this).rotate({animateTo:0})
						}
					 }

				});
			},

			_init_close_processor = function(){
				$(".close").click(function(){
					hide_tab();
                    event.notifyListeners("hidden_" + _selected_tab);
                    event.notifyListeners("block_hidden");
				});
			},

			init = function(){
				event = CRABMCE.modules.event;
				auth = CRABMCE.modules.authentication;
				_menu_items = $(".menu-cont." + _current_menu + " a");

				$(".menu-cont a").each(function(){
					var a = $(this),
						tab = a.attr('class');

					a.click(function(){
						if (a.parent().hasClass('logged') && !auth.isAuthenticated() ){
                            //unlogged user tries to open closed tab;
                            return;
                        }
                        show_tab(tab);
					});
					a.hide();
				});

				$(".menu-cont").hide();
				$(".menu-cont." + _current_menu).show();
				_fade_in_items(_menu_items);

				_init_rotate_effect();
				_init_close_processor();

				$(".block").each(function(){
					$(this).hide();
				});

				event.addListener('authentication', change_menu);

			},

			show_tab = function(tab){
				_selected_tab = tab;
				_fade_out_items(_menu_items);
			},

			hide_tab = function(){
				_fade_out_block(_selected_tab, function(){
					/*
						prevents multiple method calls for the same menu :
					    for example, for chat menu there are 2 blocks,
					    so, after hiding of each block, the same function will be called twice
					 */
					if (_selected_tab != ""){
						_selected_tab = "";
						$(".menu-cont." + _current_menu).show();
						_fade_in_items(_menu_items);
					}
				});
			},

			change_menu = function(){
				_current_menu = auth.isAuthenticated() ? 'logged' : 'unlogged';
				_menu_items = $(".menu-cont." + _current_menu + " a");
			};

		return {
			init : init,
			showTab : show_tab,
			hideTab : hide_tab,
			changeMenu : change_menu
		}

	});
})();