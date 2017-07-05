var dgram					=	require('dgram');
var adapter					=	require('../../adapter-lib.js');
var bodyParser				=	require('body-parser');
var express					=	require('express.oi');
var app						=	express().http().io();
var arduino					=	new adapter("sayit");
var status					=	{};
var timeout					=	"";

process.on("message", function(request){
	var data				= request.data;
	var status				= request.status;
	if(data){
		switch(data.protocol){
			case "setSetting":
				arduino.setSetting(data);
				break;
			default:
				arduino.log.error("Problem mit dem Protocol:" + data.protocol);
				break;
		}
	}
});

app.use(bodyParser.json());									// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));			// for parsing application/x-www-form-urlencoded
app.use('/mp3', express.static(__dirname + '/mp3'));
app.use('/', express.static(__dirname + '/www'));

app.post('/active', function(req, res){
	status[parseInt(req.body.arduinoID)].setActive(new Date().getTime());
	res.sendStatus(200);
});

app.io.route('playlist', {
	play: function(req){
		arduino.log.debug("PLAY");
		app.io.emit('play');
	},
	pause: function(req){
		arduino.log.debug("PAUSE");
		app.io.emit('pause');
	},
	add: function(req){
		app.io.emit('add', req.data);
	}
});

// setInterval(function(){
// }, 2000);

try{
	app.listen(arduino.settings.port, function(){
		process.send({"statusMessage": "Läut auf Port:" + arduino.settings.port});
	});
}catch(e){
	arduino.log.error(e);
}