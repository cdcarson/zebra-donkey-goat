var spawn = require('child_process').spawn;
var _ = require('underscore');
//var py = require('./src/py');
//py.write('8 + 2');
//py.write('8 + 3');
//py.write('copyright');
//setTimeout(function(){
//	py.write('8+6356');
//}, 2000);


var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



// view engine setup
app.set('views', './views');
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());


app.get('/', function(request, response){
	response.render('index', {title: 'Zebra Donkey Goat'});
});


io.sockets.on('connection', function (socket) {

	socket.py = false;
	socket.on('disconnect', function(){
		if (socket.py){
			socket.py.kill();
		}

	});

	//set up the queue...
	socket.py_queue = [];
	socket.py_command_running = true;

	socket.py_queue.push({
		command: '',
		request_context: 'start',
		response: [],
		response_context: 'start'
	});


	var queue_command = function(command){
		socket.py_queue.push({
			command: command,
			request_context: 'command',
			response: [],
			response_context: null
		});
		do_next_command();
	};
	var do_next_command = function(){
		if (socket.py_command_running) return;
		if (0 === socket.py_queue.length){
			socket.py_command_running = false;
			return;
		}
		var curr = socket.py_queue[0];
		socket.py_command_running = true;
		socket.py.stdin.write(curr.command + '\n', 'utf8', function(){});
	};

	var handle_response = function(data, context){
		var done = false;
		var curr = socket.py_queue[0];
		var lines = data.split('\n');

		_.each(lines, function(value){
			value = value.trim();
			if ('>>>' === value){
				if (! curr.response_context){
					curr.response_context = 'stdout';
				}
				//then we're done with the response
				//we don't want '>>>' to be included in the response
				done = true;

			} else {
				if (! curr.response_context){
					curr.response_context = context;
				}
				curr.response.push(value);
			}
		});
		if (done){
			//get rid of the first element in the queue
			//we already have it in curr
			socket.py_queue.shift();
			socket.emit('response', curr);
			socket.py_command_running = false;
			do_next_command();
		} else {
			socket.py_command_running = true;
			//make sure we save the changes...
			socket.py_queue[0] = curr;
		}
	};

	//spawn a python process...
	socket.py = spawn('python', ['-i'], { });

	socket.py.stderr.on('data', function (data) {
		console.log('stderr');
		console.log(data.toString());
		handle_response(data.toString(), 'stderr');
	});

	socket.py.stdout.on('data', function(data){
		console.log('stdout');
		console.log(data.toString());
		handle_response(data.toString(), 'stdout');
	});

	socket.on('command', function (data) {
		queue_command(data.command);

	});

	socket.py.on('close', function (code) {

		console.log('python exited with code ' + code);
	});



});

io.sockets.on('disconnect', function(socket){
	if (socket.py){
		socket.py.kill();
	}
});

app.use(express.static(path.join(__dirname, 'public')));

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

server.listen(3000);
