/**
 * utils - logger for recoding certain operation & auto-archiving log files in 'dist/logs/'.
 */

'use strict';

var stream = require('stream');

/**
 * An interface for set colors mode.
 * @param {String} content ''
 */
exports.record = function(content) {
    colors.mode = mode || 'console';
};