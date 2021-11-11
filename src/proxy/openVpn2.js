var VPN2 = {};

module.exports = VPN2;

VPN2.start = function () {
    var openvpnmanager = require('node-openvpn');
    // var openvpnBin = require('openvpn-bin');
    var path = require('path');

    // var filePath = path.normalize('../geo/ipvanish/ipvanish-AU-Sydney-syd-a16.ovpn');
    var filePath = path.normalize('D:\\CodeProjects\\webstorm\\patent\\src\\proxy\\japan.ovpn'); // D:\CodeProjects\webstorm\patent\src\proxy\japan.ovpn
    // console.log(filePath);

    var fs = require('fs');
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            // console.log('received data: ' + data.substring(0, 500).replace('\n\r', ' '));
        } else {
            console.log('err =', err);
        }
    });

    var opts = {
        // host: 'syd-a16.ipvanish.com', // normally '127.0.0.1', will default to if undefined
        // port: 443, //port openvpn management console
        // timeout: 60000, //timeout for connection - optional, will default to 1500ms if undefined
        config: filePath,
        cwd: 'C:\\Program Files\\OpenVPN\\bin'
    };
    // var auth = {
    //     user: 'email@gmail.com',
    //     pass: 'password'
    // };

    var openvpn = openvpnmanager.connect(opts)

    openvpn.on('connected', function () {
        // will be emited on successful interfacing with openvpn instance
        console.log('connected')
        // openvpnmanager.authorize(auth).then(function(res){
        //
        // });
    });

    // emits console output of openvpn instance as a string
    openvpn.on('console-output', output => {
        console.log(output)
    });

    // emits console output of openvpn state as a array
    openvpn.on('state-change', state => {
        console.log(state)
    });

    // emits console output of openvpn state as a string
    openvpn.on('error', error => {
        console.log('error: ', error)
    });

    // get all console logs up to this point
    // openvpnmanager.getLog(console.log)

    // and finally when/if you want to
    openvpnmanager.disconnect();

    // emits on disconnect
    openvpn.on('disconnected', () => {
        // finally destroy the disconnected manager
        openvpnmanager.destroy()
    });
}