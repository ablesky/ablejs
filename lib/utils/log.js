/**
 * utils - log.
 */

'use strict';

// node libs.
var events = require('events');
var util = require('util');

// external libs.
var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: ['grey', 'italic'],
    help: 'cyan',
    debug: 'blue',
    warn: 'yellow',
    error: ['red', 'inverse']
});

/**
 * @class Log
 */
function Log() {}
util.inherits(Log, events.EventEmitter);


Log.prototype.write = function(msg) {
    process.stdout.write(String(msg));
};

Log.prototype.debugMode = false;

Log.prototype.debug = function() {
    if (this.debugMode === true) {
        this.writeln.call(this, String('[ablejs debug]: ' + [].join.call(arguments, ', ')).debug);
    }
};

Log.prototype.writeln = function(msg) {
    this.write.call(this, String(msg) + '\n');
};

Log.prototype.info = function(msg) {
    this.writeln.call(this, String(msg).info);
};

Log.prototype.warn = function(msg) {
    this.writeln.call(this, String(msg).warn);
};

Log.prototype.error = function(msg) {
    this.writeln.call(this, String(msg).error);
    this.emit('error', msg);
    process.exit(11);
};


/**
 * An interface for set colors mode.
 * @param {String} mode 'According to npm module "colors", the mode value maybe "console"/"browser"/"none"'
 */
Log.prototype.setColorMode = function(mode) {
    colors.mode = mode || 'console';
};

module.exports = new Log();
