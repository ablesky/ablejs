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
    var garbagesStorePath = 'conf/.ablegc';

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
                var scope = this;
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
                                scope.collect(path);
                            }
                        });

                        file.write(garbagesStorePath, scope.list.join('\n'));

                        scope.finish();
                    });
                } catch (e) {
                    log.error(e);
                }
            },
            finish: function() {
                var gclist = file.read(garbagesStorePath);

                try {
                    cp.exec('cat < ' + garbagesStorePath + ' | ' + command4output, options, function(error, stdout, stderr) {
                        if (stderr) {
                            log.error('stderr: ' + stderr);
                        }

                        if (error !== null) {
                            log.error('exec error: ' + error);
                        }

                        log.info('deleted files: \n' + gclist);

                        gc.clear();

                        finishTask();
                    });
                } catch (e) {
                    log.error(e);
                }
            },
            collect: function(path) {
                if (this.list.indexOf(path) === -1) {
                    this.list.push(path);
                }
            },
            clear: function() {
                this.list = [];
                file.write(garbagesStorePath, '');
            }
        };

        function finishTask() {
            done();
        }

        var gc = new GC();
        gc.start();
    });

};