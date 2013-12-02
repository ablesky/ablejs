/**
 * A grunt task that for run shell command.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var exec = require('child_process').exec;

    // internal libs.
    var log = require('../utils/log');

    grunt.registerMultiTask('shell', 'A grunt task that for run shell command.', function() {
        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var options = this.options();
        var command = this.data.command;

        if (!command) {
            log.error('please config target key "command"!');
        } else {
            try {
                exec(command, options, function(error, stdout, stderr) {
                    log.info('stdout: ' + stdout);

                    if (stderr) {
                        log.error('stderr: ' + stderr);
                    }

                    if (error !== null) {
                        log.error('exec error: ' + error);
                    }

                    done();
                });
            } catch (e) {
                log.error(e);
            }

        }

    });

};