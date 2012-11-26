var menuHelper = (function($){

	var _hide_show_menu_item_effect = "drop",
		_hide_show_block_effect = "clip",
		_selected_tab = "",
		_menu_items = $([]),

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
					$(".menu-cont").show();
				}
			});
		},

		_hide_items = function(i, items){
			$(items[i]).hide( _hide_show_menu_item_effect , {}, 500, function(){
				if (i < items.length - 1){
					_hide_items( ++i, items);
				} else {
					$(".menu-cont").hide();
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
			_menu_items = $(".menu-cont a");

			_menu_items.each(function(){
				var a = $(this),
					tab = a.attr('class');

				a.click(function(){
					show_tab(tab);
				});
			});

			_init_rotate_effect();
			_init_close_processor();

			$(".block").each(function(){
				$(this).hide();
			});

		},

		show_tab = function(tab){
			_selected_tab = tab;
			_hide_items(0, _menu_items);
		},

		hide_tab = function(){
			_hide_block(_selected_tab, function(){
				_selected_tab = "";
				$(".menu-cont").show();
				_show_items(0, _menu_items);
			});
		};

	return {
		init : init,
		showTab : show_tab,
		hideTab : hide_tab
	}

})(jQuery);

/*_hide_effects = [
		"blind",
		"bounce",
		"clip",
		"drop",
		"explode",
		"fold",
		"highlight",
		"puff",
		"pulsate",
		"scale",
		"shake",
		"size",
		"slide"
	];*/