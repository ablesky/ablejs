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
	var file = require('../utils/file');
    var log = require('../utils/log');

	var minifyCSS = function(source, options) {
		try {
			return require('clean-css').process(source, options);
		} catch(e) {
            grunt.fail.errorcount++;
			log.error(e); 
		}
	};

	grunt.registerMultiTask('minifyCSS', 'Minify CSS files', function() {
		var options = this.options();

		this.files.forEach(function(element, i, array) {
			array = element.src.filter(function(filepath) {
				if (!fs.existsSync(filepath)) {
					log.warn('Source file "' + filepath + '" not found.');
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
				log.warn('Destination not written because minified CSS was empty.');
			} else {
				if (options.banner) {
					minified = options.banner + minified;
				}

				file.write(element.dest, minified, 'utf8');
				log.write('Compressed CSS File: ' + element.dest);
			}
		});
	});

};

