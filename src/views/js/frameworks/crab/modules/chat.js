(function(){

	CRABMCE.create('chat', ['event'], function(){
		//private fields
		var $ = jQuery,
			event,
			_paths = {
				addRecord : '/chat/add',
				waitForRecord : '/chat/wait'
			},
			_messagesContainer,


			_initRecordForm = function(){
				$('#addRecordForm').submit(function(){
					var self = $(this),
						params = self.serializeArray(),
						data = {};

					$.each(params, function(i, item){
						data[item.name] = item.value;
					});

					$.ajax({
						url : _paths.addRecord,
						type : 'POST',
						dataType : 'json',
						data : data,
						success : function(data){
							if (data.status == "ok"){
								_addMessage(data.record);
							}
						},
						error : function(e){
							console.log('error on record adding : ', e);
						}
					});

				});
			},

			_addMessage = function(record){
				var tmpl;
				if (_messagesContainer){
					tmpl = '<div>' +
						'<span class="date">' + record.date + '</span>' +
						'<span class="author">' + record.author + '</span>' +
						'<span class="record">' + record.record + '</span>' +
					'</div>';

					_messagesContainer.append(tmpl);
				}
			},

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
					}
				});
			},


			init = function(){
				event = CRABMCE.modules.event;
			    _messagesContainer = $("#messagesContainer");

				event.addListener('authentication', function(){
					_initRecordForm();
					_loadMessage();
				});

			};

		return {
			init : init
		};
	})

})();