var spawn = require('child_process').spawn;
var py = spawn('python', ['-i'], { });
py.stderr.on('data', function (data) {
	console.log('stderr: ' + data);
});

py.on('close', function (code) {
	console.log('python exited with code ' + code);
});

py.stdout.on('readable', function(){
	var data = py.stdout.read().toString().trim();
	var lines = data.split('\n');
	console.log('got %d bytes of data', data.length);
	console.log(lines);
});


module.exports.write = function(data){
	py.stdin.write(data + '\n', 'utf8', function(){});
};
