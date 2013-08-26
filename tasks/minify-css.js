/**
 * A grunt task that minify css files by using node package "clean-css"
 * clean-css: https://github.com/GoalSmashers/clean-css
 */

module.exports = function(grunt) {
	'use strict';

	// node libs.
	var path = require('path');
	var fs = require('fs');

	// internal libs.
	var file = require('../lib/utils/file');

	var minifyCSS = function(source, options) {
		try {
			return require('clean-css').process(source, options);
		} catch (e) {
			grunt.log.error(e);
		}
	};

	grunt.registerMultiTask('minifyCSS', 'Minify CSS files', function() {
		var options = this.options();

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
				return minifyCSS(fs.readFileSync(filename, 'utf8'), {
					relativeTo: path.dirname(filename) //  path with which to resolve relative @import rules
				});
			}).join('');

			if (minified.length < 1) {
				grunt.log.warn('Destination not written because minified CSS was empty.');
			} else {
				if (options.banner) {
					minified = options.banner + minified;
				}

				file.write(element.dest, minified, 'utf8');
				grunt.log.writeln('Compressed CSS File: ' + element.dest);
			}
		});
	});


};
