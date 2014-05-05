$(document).ready(function(){
	var el_count = 0;
	var socket = io.connect('http://localhost:3000');
	var queue = $('#queue');
	var commandline = $('#commandline');
	var commandline_inp = $('input', commandline);

	var get_el_html = function(type){
		el_count++;
		var id = 'el-' + el_count;
		var html =
			'<div class="' + type +' inserted line" id="' + id + '">' +
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

	commandline_inp.on('keyup', function(event){
		if (13 === event.keyCode){
			event.preventDefault();
			send_command();
		}
	});

	socket.on('response', function (data) {
		console.log(data);
		$('.templates').append(commandline);
		var lines = data.trim().split('\n');
		_.each(lines, function(value){

			var el, el_data;
			value = value.trim();
			if ('>>>' === value){

			} else {
				el_data = get_el_html('output');
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
