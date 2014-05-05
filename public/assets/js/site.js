$(document).ready(function(){
	var el_count = 0;
	var socket = io.connect('http://localhost:3000');
	var queue = $('#queue');
	var commandline = $('#commandline');
	var commandline_inp = $('input', commandline);
	var command_line_queue = [];
	var command_line_queue_ind = 0;

	var get_el_html = function(){
		el_count++;
		var id = 'el-' + el_count;
		var html =
			'<div class="command item inserted" id="' + id + '">' +
				$('.templates .command').html() +
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

		el_data = get_el_html('');
		commandline.before(el_data.html);
		el = $('#' + el_data.id);
		$('.input .data', el).text(cmd);
		$('.output .wait', el).show();
		$('.output .data', el).hide();
		$('.inserted', queue).slideDown('fast', function(){
			$('.inserted', queue).removeClass('inserted');
			socket.emit('command', {command: cmd});
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

	});

	socket.on('response', function (data) {
		console.log(data);
		var el = $('.command:last', queue);
		var out = $('.output .data', el);
		var icon = $('.input .prompt i', el);
		el.addClass(data.response_context);
		_.each(data.response, function(val){
			out.append('<div>' + val + '</div>');
		});
		out.slideDown('fast', function(){
			icon.removeClass('fa-refresh fa-spin');
			icon.addClass('fa-chevron-right');
			commandline_inp.focus();
		});
	});

});
