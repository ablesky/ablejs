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
    process.stdout.write(String(msg));
};

exports.writeln = function(msg) {
    exports.write.call(this, String(msg) + '\n');
};

exports.info = function(msg) {
    exports.writeln.call(this, String(msg).info);
};

exports.warn = function(msg) {
    exports.writeln.call(this, String(msg).warn);
};

exports.error = function(msg) {
    exports.writeln.call(this, String(msg).error);
    process.exit(11);
};


/**
 * An interface for set colors mode.
 * @param {String} mode 'According to npm module "colors", the mode value maybe "console"/"browser"/"none"'
 */
exports.setColorMode = function(mode) {
    colors.mode = mode || 'console';
};