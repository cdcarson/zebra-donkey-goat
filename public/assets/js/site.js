$(document).ready(function(){
	var el_count = 0;
	var socket = io.connect('http://localhost:3000');
	var queue = $('#queue');
	var commandline = $('#commandline');
	var commandline_inp = $('input', commandline);
	var command_line_queue = [];
	var command_line_queue_ind = 0;

	var get_el_html = function(type, context){
		context = context ? ' ' + context : '';
		el_count++;
		var id = 'el-' + el_count;
		var html =
			'<div class="' + type + context + ' inserted line" id="' + id + '">' +
				$('.templates .' + type).html() +
			'</div>';
		return {
			id: id,
			html: html
		};

	};
	var send_command = function(){
		var el, el_data;
		var cmd = commandline_inp.val().trim();
		command_line_queue.unshift(cmd);
		command_line_queue_ind = -1;
		commandline_inp.val('');
		$('.templates').append(commandline);
		el_data = get_el_html('input');
		queue.append(el_data.html);
		el = $('#' + el_data.id);
		$('.data', el).text(cmd);
		$('.inserted', queue).slideDown('fast', function(){
			$('.inserted', queue).removeClass('inserted');
			socket.emit('command', {command: cmd});
			queue.append(commandline);
		});
	};




	commandline_inp.on('keydown', function(event){
		switch (event.keyCode){
			case 13:
				event.preventDefault();
				send_command();
				break;
			case 40:
				if (command_line_queue_ind > 0){
					command_line_queue_ind--;
					$(this).val(command_line_queue[command_line_queue_ind]);
				} else {
					$(this).val('');
				}
				break;
			case 38:
				if (command_line_queue_ind < command_line_queue.length - 1){
					command_line_queue_ind++;
					$(this).val(command_line_queue[command_line_queue_ind]);
				}
				break;

		}
		if (13 === event.keyCode){

		} else {

		}
	});

	socket.on('response', function (data) {
		console.log(data);
		$('.templates').append(commandline);
		var lines = data.message.trim().split('\n');
		_.each(lines, function(value){

			var el, el_data;
			value = value.trim();
			if ('>>>' === value){

			} else {
				el_data = get_el_html('output', data.context);
				queue.append(el_data.html);
				el = $('#' + el_data.id);
				$('.data', el).text(value);


			}


		});
		$('.inserted', queue).slideDown('fast', function(){
			$('.inserted', queue).removeClass('inserted');
		});
		queue.append(commandline);
		commandline_inp.focus();


	});

});
