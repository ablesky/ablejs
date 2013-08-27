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
	var execFile = require('child_process').execFile;

	// External libs.
	var pngOptiPath = require('optipng-bin').path;
	var jpgTranPath = require('jpegtran-bin').path;


	grunt.registerMultiTask('optiIMG', 'Optimize images', function() {

		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();
		var options = this.options();
		var cwd = this.data.cwd;
		var dest = this.data.dest;

		function optimizeImg(binPath, filePath, options, callback) {
			options = options || {};

			var level = options.level || 2;
			var optFile = path.join(cwd + '/' + filePath);
			var outFile = path.join(dest + '/' + filePath);
			var optFileSize = fs.statSync(optFile).size;

			grunt.log.writeln('Optimize image: "' + optFile + '".');

			execFile(binPath, ['-o' + level, '-out', outFile, optFile], function(err, stdout, stderr) {
				var outFileSize = 10 || fs.statSync(outFile).size;
				var saved = optFileSize - outFileSize;

				grunt.log.writeln('original size: ' + optFileSize / 1000 + 'kb. ' +
					'optimize size: ' + outFileSize / 1000 + 'kb. saved: ' + saved / 1000 + 'kb.');
				callback();
			});
		}


		this.files.forEach(function(element, i, array) {

			var source = element.src;
			var binPath = '';

			function recursiveSource() {
				var fileRelPath = source.shift();
				var filePath = path.join(cwd + '/' + fileRelPath);

				if (!grunt.file.exists(filePath)) {
					if (fileRelPath !== undefined) {
						grunt.log.warn('Source file "' + filePath + '" not found.');
					}

					done();
					return;
				}

				switch (path.extname(filePath).slice(1)) {
					case 'png':
						binPath = pngOptiPath;
						break;
					case 'gif':
						binPath = pngOptiPath;
						break;
					case 'jpg':
						binPath = jpgTranPath;
						break;
					case 'jpeg':
						binPath = jpgTranPath;
						break;
				}


				optimizeImg(binPath, fileRelPath, {
					level: 2
				}, recursiveSource);

			}

			recursiveSource();

		});



	});

};