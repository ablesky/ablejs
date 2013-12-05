/**
 * A grunt task that for collect unnecessary files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var cp = require('child_process');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var filemap = require('../common/filemap');

    // a hidden file for store gc list.
    var garbagesStorePath = '/tmp/.ablegc';

    // A custom task that logs unnecessary files.
    grunt.registerTask('gc', 'A grunt task that for collect unnecessary files.', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var options = this.options();
        var command4input = this.args[0];
        var command4output = this.args[1];
        // fingerprints collections
        var fingerprints = Object.keys(filemap.getFingerprintMap());

        /**
         * @class GC
         */
        function GC() {
            this.list = [];
        }

        GC.prototype = {
            start: function() {
                processInput.apply(this, arguments);
            },
            finish: function() {
                generateOutput.apply(this, arguments);
            },
            collect: function(path) {
                if (this.list.indexOf(path) === -1) {
                    this.list.push(path);
                }
            },
            clear: function() {
                this.list = [];
                file.delete(garbagesStorePath);
            }
        };

        function processInput() {
            var gcInstance = this;

            try {
                cp.exec(command4input, options, function(error, stdout, stderr) {
                    if (stderr) {
                        log.error('stderr: ' + stderr);
                    }

                    if (error !== null) {
                        log.error('exec error: ' + error);
                    }

                    stdout.split('\n').forEach(function(path) {
                        if (fingerprints.indexOf(path) === -1) {
                            gcInstance.collect(path);
                        }
                    });

                    file.write(garbagesStorePath, gcInstance.list.join('\n'));

                    gc.finish();
                });
            } catch (e) {
                log.error(e);
            }
        }

        function generateOutput() {
            var gcInstance = this;
            var gclist = file.read(garbagesStorePath);

            try {
                cp.exec('cat < ' + garbagesStorePath + ' | ' + command4output, options, function(error, stdout, stderr) {
                    if (stderr) {
                        log.error('stderr: ' + stderr);
                    }

                    if (error !== null) {
                        log.error('exec error: ' + error);
                    }

                    log.info('deleted files: \n'+ gclist);

                    finishTask();
                });
            } catch (e) {
                log.error(e);
            }
        }

        function finishTask() {
            gc.clear();
            done();
        }

        var gc = new GC();
        gc.start();
    });

};