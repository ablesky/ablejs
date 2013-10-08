/**
 * utils - cssbin.
 */

'use strict';

// external libs.
// https://github.com/GoalSmashers/clean-css
var cleanCSS = require('clean-css');

// internal libs.
var log = require('./log');

/**
 * @example cssbin.minify(source, options)
 */
exports.minify = function(source, options) {
    try {
        return cleanCSS.process(source, options);
    } catch (e) {
        log.error(e);
    }
};