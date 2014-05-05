$(document).ready(function(){
	var input = $('#in');
	var output = $('#out');
	var output_el = output.get(0);
	console.log(output_el);
	//
	//console.log(mq);

	input.on('keyup', function(event){
		if (13 === event.keyCode){
			var t = input.val().split('\n');
			var o = [];
			_.each(t, function(val){
				val.trim();
				o.push('$$' + val + '$$');
			});
			output.html(o.join('<br>'));
			MathJax.Hub.Queue(["Typeset",MathJax.Hub,output_el]);

		}

	})

});
