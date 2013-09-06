/**
 * A grunt task that minify js files by using node package "uglify-js"
 * UglifyJS: https://npmjs.org/package/uglify-js
 */

module.exports = function(grunt) {
	'use strict';

	// node libs.
	var fs = require('fs');

	// internal libs.
	var file = require('../utils/file');

	grunt.registerMultiTask('uglifyJS', 'Minify JS files', function() {
		var options = this.options({
			banner: '',
			footer: '',
			compress: {
				warnings: false,
				global_defs: {
					"DEBUG": false
				},
				drop_debugger: true,
				dead_code: true
			},
			mangle: {},
			beautify: false,
			report: false,
			fromString: true
		});

		this.files.forEach(function(element, i, array) {
			array = element.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			var minified = array.map(function(filename) {
				return require("uglify-js").minify(fs.readFileSync(filename, 'utf8'), options).code;
			}).join('');

			if (minified.length < 1) {
				grunt.log.warn('Destination not written because minified JS was empty.');
			} else {
				if (options.banner) {
					minified = options.banner + minified;
				}

				file.write(element.dest, minified, 'utf8');
				grunt.log.writeln('Compressed JS File: ' + element.dest);
			}
		});
	});

};

