var spawn = require('child_process').spawn;
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
	socket.py = spawn('python', ['-i'], { });


	socket.py.on('close', function (code) {
		console.log('python exited with code ' + code);
	});

	socket.py.stderr.on('data', function (data) {
		var r = data.toString();
		var o = {
			context: 'stderr',
			message: r
		};
		socket.emit('response', o);
		console.log(r);
	});

	socket.py.stdout.on('data', function(data){
		var r = data.toString();
		var o = {
			context: 'stdout',
			message: r
		};
		socket.emit('response', o);
		console.log(r);
	});

	socket.on('command', function (data) {
		console.log(data.command);
		socket.py.stdin.write(data.command + '\n', 'utf8', function(){});
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
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

server.listen(3000);
