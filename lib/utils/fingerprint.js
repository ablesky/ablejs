/**
 * utils - fingerprint.
 */

'use strict';

// external libs.
// https://github.com/alexgorbatchev/node-crc
var crc = require('crc');
var md5 = require('MD5');

/**
 * @example fingerprint.crc
 */
exports.crc = crc;

/**
 * @example fingerprint.crc32(message)
 * @description crc32(32-bit Cyclic Redundancy Check).
 * @param {String} message
 * @return {Number} 10-bit number
 */
exports.crc32 = function(message) {
    return crc.crc32(message);
};

/**
 * @example fingerprint.md5(message)
 */
exports.md5 = function() {
    return md5.apply(null, arguments);
};

/**
 * @example fingerprint.generate(content)
 * @description the module default method.
 * @param {String} content
 * @return {String} 8-bit hex
 */
exports.generate = function(content) {
    return (exports.crc32(content) >>> 0).toString(16);
};