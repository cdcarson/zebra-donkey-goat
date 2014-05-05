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
		var row = commandline.parents('.input');
		$('.templates').append(commandline);
		row.slideUp('fast', function(){
			row.remove();
			el_data = get_el_html('input');
			queue.append(el_data.html);
			el = $('#' + el_data.id);
			$('.data', el).text(cmd);
			$('.inserted', queue).slideDown('fast', function(){
				$('.inserted', queue).removeClass('inserted');
				socket.emit('command', {command: cmd});
			});
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
		var lines = data.trim().split('\n');
		_.each(lines, function(value){
			var type = 'output';
			var el, el_data;
			value = value.trim();
			if ('>>>' === value){
				type = 'input';
			}
			el_data = get_el_html(type);
			queue.append(el_data.html);
			el = $('#' + el_data.id);
			if ('input' == type){
				$('.data', el).append(commandline);
			} else {
				$('.data', el).text(value);
			}
			$('.inserted', queue).slideDown('fast', function(){
				commandline_inp.focus();
				$('.inserted', queue).removeClass('inserted');
			});

		});


	});

});
