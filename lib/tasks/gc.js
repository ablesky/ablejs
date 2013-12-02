/**
 * A grunt task that for collect unnecessary files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var exec = require('child_process').exec;

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var filemap = require('../common/filemap');

    /**
     * GC class
     */
    function GC() {
        this.list = [];
    }

    GC.prototype = {
        start: function(func) {
            func.apply(this, arguments);
        },
        collect: function(path) {
            if (this.list.indexOf(path) > -1) {
                this.list.push(path);
            }
        },
        finish: function(func) {
            func.apply(this, arguments);
        }
    };

    // A custom task that logs unnecessary files.
    grunt.registerTask('gc', 'A grunt task that for collect unnecessary files.', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var options = this.options();
        var command4input = this.args[0];
        var command4output = this.args[1];
        // var productEnvFilesList = file.read(gcFilePath); // gc real file path in file system.
        // fingerprints collections
        var fingerprints = Object.keys(filemap.getFingerprintMap());
        var gc = new GC();

        console.log(command4input, command4output);

        function handle4output() {
            try {
                var child4output = exec(command4output, options, function(error, stdout, stderr) {
                    if (error !== null) {
                        log.error('exec error: ' + error);
                    }

                    done();
                });

                child4output.stdin.write(gc.list.join('\n'));
                child4output.stdin.end();
            } catch (e) {
                log.error(e);
            }
        }

        function readinput() {
            try {
                exec(command4input, options, function(error, stdout, stderr) {
                    if (stderr) {
                        log.error('stderr: ' + stderr);
                    }

                    if (error !== null) {
                        log.error('exec error: ' + error);
                    }

                    stdout.split('\n').forEach(function(path) {
                        if (fingerprints.indexOf(path) === -1) {
                            gc.collect(path);
                        }
                    });

                    gc.finish(handle4output);
                });
            } catch (e) {
                log.error(e);
            }
        }

        gc.start(readinput);
    });

};