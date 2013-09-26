/**
 * utils - crc32(32 - bit Cyclic Redundancy Check).
 * https://npmjs.org/package/buffer-crc32
 */

'use strict';

// external libs.
var crc32 = require('buffer-crc32');

/**
 * @example fingerprint.generate(buf)
 * @param {buffer || string} buf
 */
exports.generate = function(buf) {
    var buf = fs.readFileSync(filepath);

    return crc32.unsigned(buf).toString(16);
};