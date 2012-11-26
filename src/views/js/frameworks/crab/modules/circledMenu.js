(function(){

	CRABMCE.create('circleMenu', ['event', 'authentication'], function(){

		var $ = jQuery,
			event, auth,
			_hide_show_menu_item_effect = "drop",
			_hide_show_block_effect = "clip",
			_selected_tab = "",
			_menu_items = $([]),
			_current_menu = 'unlogged',

			 _show_block = function(tab, cb){
				$( ".block." + tab ).show( _hide_show_block_effect, {}, 500, cb );
			},

			_hide_block = function(tab, cb){
				$( ".block." + tab ).hide( _hide_show_block_effect, {}, 500, cb );
			},

			_show_items = function(i, items){
				$(items[i]).show( _hide_show_menu_item_effect , {}, 500, function(){
					if (i < items.length - 1){
						_show_items( ++i, items);
					} else {
						$(".menu-cont." + _current_menu).show();
					}
				});
			},

			_hide_items = function(i, items){
				$(items[i]).hide( _hide_show_menu_item_effect , {}, 500, function(){
					if (i < items.length - 1){
						_hide_items( ++i, items);
					} else {
						$(".menu-cont." + _current_menu).hide();
						_show_block(_selected_tab, $.noop);
					}
				});
			},

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
						show_tab(tab);
					});
					a.hide();
				});

				$(".menu-cont").hide();
				$(".menu-cont." + _current_menu).show();
				_show_items(0, _menu_items);


				_init_rotate_effect();
				_init_close_processor();

				$(".block").each(function(){
					$(this).hide();
				});

				event.addListener('authentication', change_menu);

			},

			show_tab = function(tab){
				_selected_tab = tab;
				_hide_items(0, _menu_items);
			},

			hide_tab = function(){
				_hide_block(_selected_tab, function(){
					_selected_tab = "";
					$(".menu-cont." + _current_menu).show();
					_show_items(0, _menu_items);
				});
			},

			change_menu = function(){
				_current_menu = auth.isAuthenticated ? 'logged' : 'unlogged';
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