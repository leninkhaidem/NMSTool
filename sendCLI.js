var sys = require('sys');
var spawn = require('child_process').exec;
var sendCLI = function(cli,callback) {
	var output = spawn(cli);
	output.stdout.on('data',function(data){
		callback(data);
	});
	output.stdout.on('end',function(data){
		callback('EOF');
	});

};

module.exports.sendCLI = sendCLI;
