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
	var mapfile = 'dist/hashmap.json';
	var hashmap = grunt.file.readJSON(mapfile);

	// clear data in hashmap.json
	allowHashFileTypes.forEach(function(element, i, array) {
		hashmap[element] = {};
	});

	grunt.registerMultiTask('crc32', 'generates file hashes by crc32 checksum.', function() {

		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();

		function getCRC32Hash(filepath) {
			var buf = fs.readFileSync(filepath);

			return crc32.unsigned(buf).toString(16);
		}

		this.files.forEach(function(element, i, array) {
			var basedir = element.cwd;

			element.src.forEach(function(relpath, i, array) {
				/**
				 * relpath 		  : "folder/folder/filename.png"
				 * moduleName 	  : "folder/folder/filename"
				 * moduleExtname  : ".png"
				 */
				var oldpath = path.join(basedir, relpath);
				var moduleExtname = path.extname(oldpath);
				var moduleName = path.join(path.dirname(relpath), path.basename(relpath).replace(moduleExtname, ''));

				if (!fs.existsSync(oldpath)) {
					return grunt.log.warn('Source file "' + oldpath + '" not found.');
				}

				var hash = getCRC32Hash(oldpath);
				var newpath = oldpath.replace(new RegExp(relpath + '$'), moduleName + '-' + hash + moduleExtname);
				var index = allowHashFileTypes.indexOf(moduleExtname.substring(1));
				var fileType = index > -1 ? allowHashFileTypes[allowHashFileTypes.indexOf(moduleExtname.substring(1))] : '';

				if (fileType === '') {
					return grunt.log.warn('There\'s sth wrong with source file: "' + oldpath + '".');
				} else {
					hashmap[fileType][moduleName] = hash;

					console.log('generating hash file: ' + newpath);
					fs.renameSync(oldpath, newpath);
				}
			});

		});

		fs.writeFile(mapfile, JSON.stringify(hashmap), 'utf8', function(err) {
			if (err) throw err;
			done();
		})

	});


	grunt.registerMultiTask('hashmap', 'replace files static paths by hashMap', function() {
		// Force task into async mode and grab a handle to the "done" function.
		var done = this.async();
		done.index = 0;

		var hashmap = grunt.file.readJSON(mapfile);

		console.log(hashmap);

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
					console.log(('opertating file: ' + filepath).cyan);

					done.index++;

					// Using the regular expression literal, because the RegExp object pattern(new RegExp()) can't match, i don't know why!
					var rpathExpr = /\/?((([-_A-z0-9]+\/)*[-_\w]+)\.(js|css|png|jpe?g|gif|ico)\b)/g;
					var ret = [];
					var _ftype, _fname, _fmodule, _rhash;
					var wdata = data;

					while ((ret = rpathExpr.exec(wdata)) != null) {
						_fname = ret[1];
						_fmodule = ret[2];
						_ftype = ret[4];
						_rhash = hashmap[_ftype][_fmodule];

						console.log(_rhash, 'match RegExp: ' + ret[0].cyan);

						if (_rhash) {
							wdata = wdata.replace(new RegExp(_fname, 'g'), _fmodule + '-' + _rhash + '.' + _ftype);
						}
					}

					if (wdata !== data) {
						fs.writeFileSync(filepath, wdata, 'utf8');
					}

					if (done.index === (sources.length - 1)) {
						done();
					}
				});

			});

		});


	});
};