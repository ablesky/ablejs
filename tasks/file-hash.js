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

	// var crypto = require('crypto');
	// var ciphers = crypto.getCiphers();
	// var hashes = crypto.getHashes();
	// console.log(hashes);

	var allowHashFileTypes = ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'ico'];
	var rquickExpr = new RegExp('\.(' + allowHashFileTypes.join('|') + ')', 'gm');
	var hashMap = {};

	allowHashFileTypes.forEach(function(element, i, array) {
		hashMap[element] = {};
	});


	grunt.registerMultiTask('crc32', 'generates file hashes by crc32 checksum.', function() {

		function getCRC32Hash(filepath) {
			var buf = fs.readFileSync(filepath);

			return crc32.unsigned(buf).toString(16);
		}

		this.files.forEach(function(element, i, array) {
			var basedir = element.cwd;

			element.src.forEach(function(relpath, i, array) {
				/**
				 * relpath 		  : "market/index/search-top.png"
				 * moduleName 	  : "market/index/search-top"
				 * moduleHashname : "market/index/search-top-da833f5f"
				 * moduleExtname  : ".png"
				 */
				var oldpath = path.join(basedir, relpath);
				var moduleExtname = path.extname(oldpath);
				var moduleName = path.join(path.dirname(relpath), path.basename(relpath).replace(moduleExtname, ''));

				if (!fs.existsSync(oldpath)) {
					return grunt.log.warn('Source file "' + oldpath + '" not found.');
				}

				// return console.log(moduleName, moduleExtname, oldpath)

				var hash = getCRC32Hash(oldpath);
				var moduleHashname = moduleName + '-' + hash;
				var newpath = oldpath.replace(new RegExp(relpath + '$'), path.join(moduleHashname, moduleExtname));
				var index = allowHashFileTypes.indexOf(moduleExtname.substring(1));
				var fileType = index > -1 ? allowHashFileTypes[allowHashFileTypes.indexOf(moduleExtname.substring(1))] : '';

				if (fileType === '') {
					return grunt.log.warn('There\'s sth wrong with source file: "' + oldpath + '".');
				} else {
					hashMap[fileType][moduleName] = moduleHashname;

					console.log('generating hash file: ' + newpath);
					fs.renameSync(oldpath, newpath);
				}
			});

		});

	});


	grunt.registerMultiTask('hashmap', 'replace files static paths by hashMap', function() {
		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();
		done.index = 0;

		this.files.forEach(function(element, i, array) {
			var basedir = element.cwd;
			var sources = element.src;

			sources.forEach(function(relpath, i, array) {
				var filepath = path.join(basedir, relpath);

				if (!fs.existsSync(filepath)) {
					return grunt.log.warn('Source file "' + filepath + '" not found.');
				}

				fs.readFile(filepath, 'utf8', function(err, data) {
					if (err) throw err;
					done.index++;

					console.log(data)
					// data.replace(rquickExpr, )

					if (done.index === (sources.length - 1)) {
						done();
					}
				});
			});

		});


	});
};