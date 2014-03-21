/**
 * A grunt task that for ablejs server.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var http = require('http');
    var net = require('net');
    var url = require('url');

    // internal libs.
    // var log = require('../utils/log');

    // A custom task that logs stuff.
    grunt.registerTask('server', 'A grunt task that for ablejs server.', function() {

        var done = this.async();
        // var options = this.options();
        var port = 1337;
        var host = '192.168.3.47';

        // Create an HTTP tunneling proxy
        var server = http.createServer(function(req, res) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            
            res.end('okay');
        });

        server.on('close', function(req, cltSocket, head) {
            // close the http server
            done();
        });

        server.on('clientError', function(exception, socket) {
            console.log(exception, socket)
            // close the http server
            done();
        });

        // now that proxy is running
        server.listen(port, host, function() {

            console.log('listened! port:' + port);

            // make a request to a tunneling proxy
            var options = {
                port: port,
                hostname: host,
                method: 'post'
            };

            var req = http.request(options, function(res) {
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    console.log('BODY: ' + chunk);
                });
            });

            req.end();
        });


    });

};