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

	// external libs.
	var pngOptiPath = require('optipng-bin').path;
	var jpgTranPath = require('jpegtran-bin').path;

	// internal libs.
	var file = require('../utils/file');
    var log = require('../utils/log');

	grunt.registerMultiTask('optiIMG', 'Optimize images', function() {

		// force task into async mode and grab a handle to the "done" function.
		var done = this.async();
		var cwdbase = this.data.cwd;
		var destbase = this.data.dest;

		this.files.forEach(function(element, i, array) {

			var sources = element.src;
			var binPath = '';
			var options = [];

			function recursiveSource() {
				var fileRelPath = sources.shift();
				var sourceFile = path.join(cwdbase + '/' + fileRelPath);
				var resultFile = path.join(destbase + '/' + fileRelPath);
				var sourceType = path.extname(sourceFile).slice(1);

				if (!fs.existsSync(sourceFile)) {
					if (fileRelPath !== undefined) {
						log.writeln(('Source file "' + sourceFile + '" not found.').red + ' \n');
					} else {
						done();
					}

					return;
				} else {
					log.writeln('source image: ' + sourceFile.yellow);
					log.writeln('result image: ' + resultFile.yellow);
				}

				if (fs.existsSync(resultFile) && (sourceType === 'png' || sourceType === 'gif')) {
					file.delete(resultFile);
				} else {
					file.mkdir(path.dirname(resultFile));
				}

				switch (sourceType) {
					case 'gif':
					case 'png':
						binPath = pngOptiPath;
						options = ['-force', '-strip', 'all', '-o', 2, '-out', resultFile, sourceFile];
						break;
					case 'jpg':
					case 'jpeg':
						binPath = jpgTranPath;
						options = ['-copy', 'none', '-optimize', '-outfile', resultFile, sourceFile];
						break;
					default:
						grunt.file.copy(sourceFile, resultFile);
						log.writeln('Just copy source file: "' + sourceFile + '".');

						return recursiveSource();
				}

				optimizeImg(binPath, sourceFile, resultFile, options, recursiveSource);
			}

			recursiveSource();

		});

		function optimizeImg(binPath, sourceFile, resultFile, options, callback) {
			execFile(binPath, options, function(err, stdout, stderr) {
				if (!fs.existsSync(resultFile)) {
					grunt.file.copy(sourceFile, resultFile);
					log.writeln('Just copy source file. Optimize fail!'.red + ' \n');

					callback();
					return;
				}

				var optFileSize = fs.statSync(sourceFile).size;
				var outFileSize = fs.statSync(resultFile).size;
				var saved = optFileSize - outFileSize;

				log.writeln('source size: ' + (optFileSize / 1000 + 'kb').cyan +
					'. result size: ' + (outFileSize / 1000 + 'kb').cyan + '.  saving: ' + (saved / 1000 + 'kb').cyan + ' . \n');

				callback();
			});
		}

	});

};
