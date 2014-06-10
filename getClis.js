var cli = require('./sendCLI');
var fs = require('fs');
var prev_message;
var completed;
var connections;
exports.execute = function(ips, devConfig, settings, callback) {
    fs.writeFile('./logs/lock.file', ips.length);
    completed = 0;
    connections = settings.connectionInput;
    var debug = 0;
    var date = new Date();
    date = date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear() + "_" + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + "_" + date.getMilliseconds();
    for (var i = 0; i < connections; i++) {
        getCli(function(data) {
            callback(data);
        });
    };

    function getCli(callback2) {
        if (ips.length == 0) {
            cli.sendCLI('rm -rf ./logs/lock.file', function() {});
            return;
        }
        var dev_ip = ips.pop();
        cli.sendCLI('perl ./getClis.pl ' + dev_ip + " " + settings.serverIP + " " + settings.serverUsername + " " + settings.serverPassword + " " + devConfig[dev_ip].devUser + " " + devConfig[dev_ip].devPassword + " " + devConfig[dev_ip].devEnPassword + " " + settings.promptTimeout + " " + settings.EnPromptTimeout + " " + debug + " " + settings.proxyMode + " " + settings.enMode + " " + date + " " + settings.cli, function(data) {
            if (data == 'EOF') {
                completed++;
                callback2(completed);
                getCli(function(data) {
                    callback(data);
                });
            }
            //callback2(data);

        });
    }
}
