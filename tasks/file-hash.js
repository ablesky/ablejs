/**
 * A grunt task that generates file hashes using CRC32 (32-bit Cyclic Redundancy Check).
 * https://github.com/alexgorbatchev/node-crc
 */

module.exports = function(grunt) {
	'use strict';

	// node libs.
	var fs = require('fs');
	var path = require('path');

	// external libs.
	var crc32 = require('buffer-crc32');

	var crypto = require('crypto');
	var ciphers = crypto.getCiphers();
	var hashes = crypto.getHashes();
	console.log(hashes);
	// console.log(require('../../asbuild/js/common/global').children);

	var hashTypes = ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'ico'];

	grunt.registerMultiTask('crc32', 'generates file hashes', function() {
		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();

		function getCRC32Hash(filepath) {
			var buf = fs.readFileSync(filepath);

			return crc32.unsigned(buf).toString(16);
		}

		this.files.forEach(function(element, i, array) {
			element.src.forEach(function(filepath) {
				if (!fs.existsSync(filepath)) {
					return grunt.log.warn('Source file "' + filepath + '" not found.');
				}

				var hash = getCRC32Hash(filepath);
				var extname = path.extname(filepath);
				var newpath = filepath.replace(new RegExp(extname + '$'), '-' + hash + extname);

				// console.log('generate new hash file: ' + newpath);
				// fs.renameSync(filepath, newpath);
			});

		});

		done();
	});

};