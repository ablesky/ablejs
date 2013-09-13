/**
 * utils - log.
 */

'use strict';

// external libs.
var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    debug: 'blue',
    warn: 'yellow',
    error: 'red'
});

/**
 * You can seed the args color, but this is only used internally.
 */
exports.write = function(msg) {
    process.stdout.write(msg || '');
};

exports.writeln = function(msg) {
    exports.write.call(this, msg + '\n');
};

exports.warn = function(msg) {
    exports.writeln.call(this, (msg || '').warn);
};

exports.error = function(msg) {
    process.stderr.write((msg || '').error + '\n');
    process.exit(1);
};