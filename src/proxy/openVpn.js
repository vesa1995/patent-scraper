var exec = require('child_process').exec;
var psTree = require('ps-tree');

var kill = function (pid, signal, callback) {
    signal = signal || 'SIGKILL';
    callback = callback || function () {
    };
    var killTree = true;
    if (killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try {
                    process.kill(tpid, signal)
                } catch (ex) {
                }
            });
            callback();
        });
    } else {
        try {
            process.kill(pid, signal)
        } catch (ex) {
        }
        callback();
    }
};

var VPN = {};

VPN.start = function () {
    let ovpnProcess;
    ovpnProcess = exec('openvpn ./proxy/japan.ovpn');
    console.log(ovpnProcess.platform, ' - platform');

    ovpnProcess.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    ovpnProcess.stderr.on('data', function (data) { // doesnt work for 'error' ????
        console.log('stderr: ' + data);
    });
    ovpnProcess.on('close', function (code) {
        console.log('closing code: ' + code);
    });

    var closeCon = {};
    closeCon.fn = function () {
        console.log('close connection');
        var isWin = /^win/.test(ovpnProcess.platform);
        if (!isWin) {
            kill(ovpnProcess.pid);
        } else {
            var cp = require('child_process');
            cp.exec('taskkill /PID ' + ovpnProcess.pid + ' /T /F',
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                });
        }
    }
    closeCon['fn']();

}


module.exports = VPN;