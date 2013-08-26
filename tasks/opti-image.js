/**
 * A grunt task that optimize image files by using node package
 * jpegtran-bin: https://github.com/yeoman/node-jpegtran-bin
 * optipng-bin: https://github.com/yeoman/node-optipng-bin
 */

module.exports = function(grunt) {
	'use strict';

	// node libs.
	var path = require('path');
	var fs = require('fs');

	// internal libs.
	var file = require('../lib/utils/file');

	var execFile = require('child_process').execFile;
	var optipngPath = require('optipng-bin').path;
	var jpgtranPath = require('jpegtran-bin').path;


	grunt.registerMultiTask('optiIMG', 'Optimize images', function() {

		var options = this.options();
		var cwd = this.data.cwd;
		var dest = this.data.dest;

		var argv = [];
		var pngFiles = [];
		var jpgFiles = []; // include jpg & jpeg.


		// this.files.forEach(function(element, i, array) {

		// 	element.src.forEach(function(filepath) {
		// 		filepath = path.join(cwd + '/' + filepath);

		// 		if (!grunt.file.exists(filepath)) {
		// 			grunt.log.warn('Source file "' + filepath + '" not found.');
		// 			return false;
		// 		} else {
		// 			grunt.log.writeln('Found file "' + filepath + '".');
		// 		}

		// 		switch (path.extname(filepath)) {
		// 			case 'png':
		// 				pngFiles.push(filepath);
		// 				break;
		// 			case 'gif':
		// 				pngFiles.push(filepath);
		// 				break;
		// 			case 'jpg':
		// 				jpgFiles.push(filepath);
		// 				break;
		// 			case 'jpeg':
		// 				jpgFiles.push(filepath);
		// 				break;
		// 		}

		// 		// minifyCSS(fs.readFileSync(filename, 'utf8'), {
		// 		// 	relativeTo: path.dirname(filename) //  path with which to resolve relative @import rules
		// 		// });
		// 	});

		// });

		try {
			require('child_process').execFile('/usr/local/bin/npm', ['-v'], function(err, stdout, stderr) {
				console.log(err, stdout, stderr);
				console.log('OptiPNG version:', stdout.match(/\d\.\d\.\d/)[0]);
			});
		} catch (e) {}


	});

};