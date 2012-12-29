(function(){

	CRABMCE.create('chat', ['event', 'authentication', 'globalMessages', 'sizes'], function(){
		//private fields
		var $ = jQuery,
			event, auth, globalMessage, sizes,
			_paths = {
				addRecord : '/chat/add',
				getRecords : {

					all : {
						records : '/chat/records/all',
						range : '/chat/records/all/range',
						count : '/chat/records/all/count',
						last : '/chat/records/all/last'
					},

					recent : {
						records : '/chat/records/recent',
						range : '/chat/records/recent/range',
						count : '/chat/records/recent/count',
						last : '/chat/records/recent/last'
					},

					period : {
						records : '/chat/records/period',
						range : '/chat/records/period/range',
						count : '/chat/records/period/count',
						last : '/chat/records/period/last'
					}

				},
				waitForRecord : '/chat/wait',
				checkAlive : '/alive'
			},
			_initialized = false,
			_records_type = 'yesterday',
			_messagesContainer,
			_scrollPane,

			/**
			 * Tabs for messages period selection;
			 * Key is the corresponding span's value
			 *
			 * @private
			 * @property _tabs
			 * @type Object
			 */
			_tabs = {
				'yesterday'	: {
					'path' : 'recent'
				},
				'7days' : {
					'path' : 'period',
					'period' : 'day',
					'number' : 7
				},
				'30days' : {
					'path' : 'period',
					'period' : 'day',
					'number' : 30
				},
				'3month' : {
					'path' : 'period',
					'period' : 'month',
					'number' : 3
				},
				'6month' : {
					'path' : 'period',
					'period' : 'month',
					'number' : 6
				},
				'1year' : {
					'path' : 'period',
					'period' : 'year',
					'number' : 1
				},
				'all' : {
					'path' : 'all'
				}
			},

			/**
			 * jQuery DOM element, storing ajax-loader for chat block;
			 *
			 * @private
			 * @property _ajaxLoaderChat
			 * @type jQuery
			 */
			_ajaxLoaderChat,

			_initRecordForm = function(){
				$('#addRecordForm').submit(function(){
					var self = $(this),
						params = self.serializeArray(),
						data = {},
						hasEmptyValue = false;

					$.each(params, function(i, item){
						data[item.name] = item.value;
						hasEmptyValue = hasEmptyValue || (item.value == "");
					});
					self.each(function(){
						this.reset();
					});

					if (hasEmptyValue) {
						return;
					}

					$.ajax({
						url : _paths.addRecord,
						type : 'POST',
						dataType : 'json',
						data : data,
						success : function(data){
							if (data.status != "ok"){
								console.log('error on record adding : ');
                                globalMessage.showMessage('warning', 'Error', 'Record adding failed');
							}
						},
						error : function(e){
							console.log('error on record adding : ', e);
                            globalMessage.showMessage('warning', 'Error', 'Error on record adding');
						}
					});

				});
			},

			/**
			 * Initializes tabs click listener;
			 * On tab click, loads messages for the specified period, which is extracted from 'value' attribute;
			 *
			 * @method _initTabs
			 * @private
			 */
			_initTabs = function(){
				var tabs = $(".chat-tab");
				tabs.each(function(){
					var t = $(this);

					t.click(function(){
						tabs.removeClass('active');
						t.addClass('active');
						_records_type = t.attr('data-value');
						_navigationToolbar.notifyListeners('period_changed');
						_loadMessages(_records_type, true);
					});
				});
			},

			/**
			 * Formats date to HH:MM:SS, d/mm/yyyy format;
			 *
			 * @method
			 * @private
			 * @param {String} dateStr String to be formatted;
			 *
			 * @return {String} formatted string;
			 */
			_formatDate = function(dateStr){
				var d = new Date(dateStr),
					appendNull = function(t){
						return t < 10 ? "0" + t : t;
					},
					res;

				res = d.getHours() + ":" + appendNull(d.getMinutes()) + ":" + appendNull(d.getSeconds()) + ", " +
					d.getDate() + "/" + appendNull(d.getMonth() + 1) + "/" + d.getFullYear();

				return res;
			},

			/**
			 * Returns html template for chat record;
			 *
			 * @param record Record the html template to generate for;
			 */
			_getMessageTemplate = function(record){
				return '<article class="article">' +
						'<span class="author">' + (record.authorId ? record.authorId.login : "") + '</span>' +
						'<span class="date">' + _formatDate(record.date) + '</span>' +
						'<span class="record">' + (record.record || "").replace(/\n/gi, '<br />') + '</span>' +
						'<span class="separator"></span>' +
					'</article>';
			},

			/**
			 *  adds a single record to messages container and
			 *  if the number of visible messages exceeds the number of messages per page, then removes the first one;
			 *
			 *  @param record Record to be added;
			 */
			_addMessage = function(record){
				if (_messagesContainer && _navigationToolbar.isFirstPage()){
					_messagesContainer.append(_getMessageTemplate(record));
					while (_messagesContainer.children().length > _navigationToolbar.messagesPerPage){
						_messagesContainer.children(":first").remove();
					}
					_scrollPane.data('jsp').reinitialise();
				}
			},

			/**
			 * Entirely updates shown messages with new ones;
			 *
			 * @param records Records to show
			 */
			_showMessages = function(records){
				records = records || [];
				_messagesContainer.empty();
				_ajaxLoaderChat.hide();
				$.each(records, function(i, record){
					_messagesContainer.append(_getMessageTemplate(record));
				});
				_scrollPane.data('jsp').reinitialise();
			},

			/**
			 * Waits for messages;
			 */
			_loadMessage = function(data){
				if (data && data.record){
					_addMessage(data.record);
				}

				$.ajax({
					url : _paths.waitForRecord,
					type : 'GET',
					cache : false,
					success : function(data){
						_loadMessage(data);
						_navigationToolbar.loadMessagesCount(_records_type, function(){
							_navigationToolbar.notifyListeners('messages_updated');
						});
					},
					error : function(){
						_checkServerState(function(){
							_loadMessage();
						});
					}
				});
			},

			/**
			 * Loads messages of the specified type;
			 * If isFirstLaunch is true, then we have to load last messages;
			 */
		    _loadMessages = function(type, isFirstLaunch){

			    var rangeType = _navigationToolbar.currentRangeType.type,
			        params = rangeType == _navigationToolbar.rangeTypes.range && !isFirstLaunch
				        ? { from : _navigationToolbar.currentRangeType.from, to : _navigationToolbar.currentRangeType.to }
				        : {};

			    if (isFirstLaunch){
					rangeType = "last";
				    params.to = _navigationToolbar.messagesPerPage;
			    }
			    type = _paths.getRecords.hasOwnProperty(_tabs[type].path) ? type : 'all';
				if ( _tabs[type].path == "period" ){
					$.extend(params, {
						'period' : _tabs[type].period,
						'number' : _tabs[type].number
					});
				}
				_ajaxLoaderChat.show();

				$.ajax({
					url : _paths.getRecords[_tabs[type].path][rangeType],
					type : 'GET',
					dataType : 'json',
					data : params,
					cache : false,
					success : function(data){
						_showMessages((data || []).records);
						_navigationToolbar.loadMessagesCount(type, function(){
							_navigationToolbar.notifyListeners('messages_updated');
						});
					},
					error : function(err){
						console.log("Failed to load messages : ", err);
                        globalMessage.showMessage('error', 'Error', 'Failed to load messages : ' + err.responseText || "");
						_scrollPane.show();
					}
				});
		    },

			/**
			 * Checks server state and if it's still alive, then executes callback function;
			 *
			 * @param cb Callback to be executed if server is alive;
			 */
			_checkServerState = function(cb){
				$.ajax({
					url : _paths.checkAlive,
					dataType: 'json',
					method : 'GET',
					success: function(data){
						if (data && data.status == "ok"){
							if (typeof cb === "function"){
								cb();
							}
						} else {
							globalMessage.showMessage('warning', "Server stopped", "Server stopped working. To keep chating, try to login later");
						}
					},
					error : function(){
						globalMessage.showMessage('warning', "Server stopped", "Server stopped working. To keep chating, try to login later");
					}
				})
			},

			_navigationToolbar = {

				/*
					Total number of messages;
				 */
				messagesCount : 0,

				/*
					Number of messages to show per page;
				 */
				messagesPerPage : 10,

				/*
					Current page number;
				 */
				currentPage : null,

				/*
					Total number of pages;
				 */
				totalPages : null,

				/**
				 * Refs to dom elements, containing toolbar elements;
				 */
				containers : {
					pageSwitcher : null,
					viewStartNumber : null,
					viewEndNumber : null,
					viewTotalNumber : null,
					viewsPerPageSelector : null
				},

				/**
				 * Array of event listeners
				 */
				eventListeners : {},

				addListener : function(type, cb){
					if ( !this.eventListeners.hasOwnProperty(type) ){
						this.eventListeners[type] = [];
					}
					this.eventListeners[type].push(cb);
				},

				notifyListeners : function(type){
					var i, l;
					if ( this.eventListeners.hasOwnProperty(type) ){
						for ( i = 0, l = this.eventListeners[type].length; i < l; i++ ){
							this.eventListeners[type][i]();
						}
					}
				},

				/**
				 * List of available range types:
				 *  - all - all messages are loaded;
				 *  - range - only the range of messages is loaded;
				 */
				rangeTypes : {
			    	'all' : 'records',
					'range' : 'range'
				},

				/**
				 * Currently selected range type;
				 */
				currentRangeType : {
					type : '',
					from : 0,
					to : 0
				},

				/**
				 * Initializes navigation toolbar;
				 */
				init : function(){
					var self = this;

					this.currentRangeType.type = this.rangeTypes.range;
					this.currentRangeType.to = this.messagesPerPage;

					this.containers.viewTotalNumber = $("#total_view_number");
					this.containers.viewStartNumber = $("#start_view_number");
					this.containers.viewEndNumber = $("#end_view_number");
					this.containers.pageSwitcher = $("#page_switcher");
					this.containers.viewsPerPageSelector = $("#view_per_page_selector");


					this.containers.viewsPerPageSelector.change(function(){
						var v = $(this).val();

						if ( v == "all" ){
							self.currentRangeType.type = self.rangeTypes.all;
						} else {
							self.messagesPerPage = Number(v);
						}

						self.notifyListeners("messages_per_page_changed");
					});

					this.addListener("page_switched", function(){
						self.currentPage = self.pagesSwitcher.currentPage;
						self.updatePagesCount();
						self.notifyListeners("update_page");
					});

					this.addListener("period_changed", function(){
						self.currentPage = null;
						self.loadMessagesCount(_records_type, function(){
							self.notifyListeners('redraw_toolbar');
						});
					});

					this.addListener("messages_per_page_changed", function(){
						self.currentPage = null;
						self.loadMessagesCount(_records_type, function(){
							// triggering 'update_page' event to reload messages
							self.notifyListeners("update_page");
							self.notifyListeners('redraw_toolbar');
						});
					});

					this.pagesSwitcher.init({
						container : this.containers.pageSwitcher,
						event : this,
						currentPage : 1,
						totalPages : 1
					});

				},

				/**
				 *
				 * @param type Message type : recent, all ...
				 * @param cb   Callback to be executed;
				 */
				loadMessagesCount : function(type, cb){
					var self = this,
						t = _paths.getRecords.hasOwnProperty(_tabs[type].path) ? type : 'all',
						url = _paths.getRecords[_tabs[t].path].count,
						params = {};

					if ( _tabs[t].path == "period" ){
						$.extend(params, {
							'period' : _tabs[t].period,
							'number' : _tabs[t].number
						});
					}

					$.ajax({
						url : url,
						type : 'GET',
						data : params,
						cache : false,
						success : function(data){
							self.updateMessagesCount(data);
							self.updatePagesCount();
							self.updateViewNumbers();

							if (typeof cb === "function"){
								cb();
							}
						}
					});
				},

				/**
				 * Updates field, indicating total number of messages
				 *
				 * @param data
				 */
				updateMessagesCount : function(data){
					this.messagesCount = data ? data.number || 0 : 0;
					this.containers.viewTotalNumber.html(this.messagesCount);
				},

				/**
				 * Updates total number of pages and current page number;
				 */
				updatePagesCount : function(){
					if (this.currentRangeType.type == this.rangeTypes.all){
						this.totalPages = 1;
						this.currentPage = 1;

						this.currentRangeType.from = 1;
						this.currentRangeType.to = this.messagesCount;
					} else {
						this.totalPages = Math.ceil(this.messagesCount/this.messagesPerPage, 0);
						/*
							avoid zero
						 */
						this.totalPages = this.totalPages ? this.totalPages : "1";
					}

					if (this.currentPage == null){
						this.currentRangeType.from = Math.min( Math.max(this.messagesCount - this.messagesPerPage + 1, 1) , this.messagesCount );
						this.currentRangeType.to = this.messagesCount;
						this.currentPage = 1;
					} else {
						/*
							Have to count from the end :
							first page corresponds to the last messages;
						 */
						this.currentRangeType.from = Math.min( Math.max(this.messagesCount - this.currentPage*this.messagesPerPage + 1, 1) , this.messagesCount );
						this.currentRangeType.to = Math.min(this.messagesCount, this.messagesCount - (this.currentPage - 1)*this.messagesPerPage);
					}

					this.pagesSwitcher.currentPage = this.currentPage;
					this.notifyListeners("pages_number_changed");
				},

				/**
				 * Updates numbers of currently showed views;
				 */
				updateViewNumbers : function(){
					this.containers.viewStartNumber.html(this.currentRangeType.from);
					this.containers.viewEndNumber.html(this.currentRangeType.to);
				},

				/**
				 * Returns true if user currently sees the last page;
				 */
				isFirstPage : function(){
					return this.currentPage == 1;
				},

                /**
                 * Pages switcher;
                 * Toolbar which aligns at the bottom and responsible for pages switching;
                 */
				pagesSwitcher : {

					/*
						Number of visible buttons which proceed and follow current page;
					 */
					range : 1,

					/*
						Toolbar container buttons to be placed to;
					 */
					container : null,

					/*
						Number of currently selected page;
					 */
					currentPage : 1,

					/*
						Total number of pages;
					 */
					totalPages : 1,

					/*
						Event object;
					 */
					event : null,

					/**
					 * 	Initializes plugin;
					 *
					 *	@param o {Object} Options to be set are:
					 *						- container
					 *						- currentPage
					 *						- totalPages
					 *                      - event object;
					 */
					init : function(o){
						var self = this,
                            initial = true;

						o = $.extend({
								container : null,
								event : _navigationToolbar,
								currentPage : 1,
								totalPages : 1
							}, o);

						this.container = o.container;
						this.currentPage = o.currentPage;
						this.totalPages = o.totalPages;
						this.event = o.event;
						this.construct(this.currentPage, this.totalPages);

						this.event.addListener("pages_number_changed", function(){
							self.totalPages = _navigationToolbar.totalPages;
                            if ( initial ){
                                initial = false;
                                self.construct(self.currentPage, self.totalPages);
                            }
						});
						this.event.addListener("redraw_toolbar", function(){
							self.construct(self.currentPage, self.totalPages);
						});
					},

					/**
					 *	Constructs pages switcher :
					 *	Visible buttons are : first page, last page and
					 *	a range of pages before and after the currently selected page;
					 *
					 *	This range is specified by 'range' parameter;
					 *
					 *	@param currentPage {Number} Number of currently selected page;
					 *	@param totalPages {Number}  Total number of pages;
					 */
					construct : function(currentPage, totalPages){
						var self = this,
							html = '',
							i = 1;

						html += this.getButton(i, i++ == currentPage);
						for ( i ; i < currentPage - this.range ; i++ ){
							html += this.getDots();
							i = currentPage - this.range - 1; // we don't need repeating dots;
						}
						for ( i ; i <= Math.min(currentPage + this.range, totalPages) ; i++ ){
							html += this.getButton(i, i == currentPage);
						}
						for ( i ; i < totalPages ; i++ ){
							html += this.getDots();
							i = totalPages - 1; // we don't need repeating dots;
						}
						for ( i ; i <= totalPages ; i++ ){
							html += this.getButton(i, i == currentPage);
						}

						if ( this.container ){
							this.container.html( html );
							this.container.find('.toolbar_page_button').each(function(i, item){
								var b = $(item),
									n = Number(b.html());

								b.click(function(){
									self.showPage(n);
								});
							});
						}
					},

					/**
					 * Gets html template for toolbar button, pointing at the specified page;
					 *
					 * @param {Number} number     Page number
					 * @param {Boolean} isActive  Whether the page is active or not;
					 */
					getButton : function(number, isActive){
						return '<span ' +
							'class="toolbar_page_button page_' + number + (isActive ? ' active' : '') + '" >' +
								number +
							'</span>';
					},

					/**
					 * Gets dots template;
					 */
					getDots : function(){
						return  '<span class="toolbar_dots" >...</span>';
					},

					/**
					 * Constructs toolbar with the specified page marked as active and
					 * notifies listeners about page change;
					 *
					 * @param n {Number} Page to be selected;
					 */
					showPage : function(n){
						this.currentPage = n;
						this.construct(this.currentPage, this.totalPages);
						this.event.notifyListeners("page_switched");
					}

				}
			},

            /**
             * Sets sizes;
             */
            _setSizes = function(){
                $('.chat-tabs').width(sizes.getBlockWidth() - 100);
                $('.scroll-pane').css({ width : sizes.getBlockWidth() - 100 + "px"});
            },

			init = function(){
				event = CRABMCE.modules.event;
				auth = CRABMCE.modules.authentication;
				globalMessage = CRABMCE.modules.globalMessages;
                sizes = CRABMCE.modules.sizes;

			    _messagesContainer = $("#messagesContainer");
				_ajaxLoaderChat = $("#chat_ajax_loader");

				_navigationToolbar.init();
				_navigationToolbar.addListener("update_page", function(){
					_loadMessages(_records_type, false);
				});

                _setSizes();
				_scrollPane = $('.scroll-pane').jScrollPane({
					verticalDragMinHeight: 20,
					verticalDragMaxHeight: 20,
					stickToBottom : true,
					animateScroll : true
				});

				event.addListener('showed_chat', function(){
					if ( auth.isAuthenticated() && !_initialized){
						_initRecordForm();
						_initTabs();
						_loadMessage();
						_loadMessages(_records_type, true);
						_initialized = true;
					}
				});

			};

		return {
			init : init
		};
	})

})();