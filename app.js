/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var getCli = require("./getClis.js");
var cli = require("./sendCLI.js");
var app = express();
var socketListener = app.listen(3000);
var io = require("socket.io").listen(socketListener, {
    log: false
});
var clients = {};
var fs = require('fs');
// all environments
cli.sendCLI('rm -rf ./logs/lock.file', function() {});
//app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/images/tools.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', function(req, res) {
    res.render('home');
});
app.get('/t1', function(req, res) {
    var status = fs.existsSync('./logs/lock.file');
    if (status) {
        res.render('wait', {
            total: fs.readFileSync('./logs/lock.file')
        });
    } else {
        res.render('t1');
    }
});


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port 3000');
});

io.sockets.on('connection', function(socket) {
    clients[socket.id] = socket;
    socket.on('run', function(data) {
        fs.writeFile('./clis', data.settings.cli);
        var ips = [];
        for (ip in data.deviceDetails) {
            ips.push(ip);
        }
        getCli.execute(ips, data.deviceDetails, data.settings, function(data) {
            console.log(data);
            socket.emit('message', {
                count: data
            })
        });
    });
    socket.on('destroy', function() {
        console.log("disconnect message received")
        delete clients[socket.id];
    })
});
