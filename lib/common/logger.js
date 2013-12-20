/**
 * utils - logger for recoding certain operation & auto-archiving log files in 'dist/logs/'.
 */

'use strict';


/**
 * An interface for set colors mode.
 * @param {String} content ''
 */
exports.record = function(content) {
    colors.mode = mode || 'console';
};
