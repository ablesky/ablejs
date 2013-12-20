/**
 * utils - shell interface.
 */

// node libs.
var exec = require('child_process').exec;

// internal libs.
var log = require('../utils/log');

/**
 * execute shell command.
 * @param  {String} command "shell cmd"
 * @param  {Object|null} options "exec args"
 * @param  {Function} next "callback"
 */
exports.exec = function(command, options, next) {
    if (typeof options === 'function') {
        next = options;
    }

    if (!command) {
        log.error('please type "command"!');
    } else {
        try {
            exec(command, options, function(error, stdout, stderr) {
                if (stderr) {
                    log.error('stderr: ' + stderr);
                } else if (error !== null) {
                    log.error('exec error: ' + error);
                } else {
                    log.writeln(stdout);
                }

                if (next) {
                    next();
                }
            });
        } catch (e) {
            log.error(e);
        }
    }
};