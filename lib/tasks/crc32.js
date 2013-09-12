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

    // internal libs.
    var file = require('../utils/file');

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
        var options = this.options();
        var keep = !!options.keep;

        function getCRC32Hash(filepath) {
            var buf = fs.readFileSync(filepath);

            return crc32.unsigned(buf).toString(16);
        }

        this.files.forEach(function(element, i, array) {
            
            var basedir = element.cwd;
            var destdir = element.dest;

            element.src.forEach(function(relpath, i, array) {
                /**
                 * relpath: "folder/folder/filename.png"
                 * moduleName: "folder/folder/filename"
                 * moduleExtname: ".png"
                 */
                var originPath = path.join(basedir, relpath);
                var destPath = path.join(destdir, relpath);
                var moduleExtname = path.extname(destPath);
                var moduleName = path.join(path.dirname(relpath), path.basename(relpath).replace(moduleExtname, ''));

                if (!fs.existsSync(originPath)) {
                    return grunt.log.warn('Source file "' + originPath + '" not found.');
                } else {
                    file.write(destPath, fs.readFileSync(originPath, 'utf8'), 'utf8');
                }

                var hash = getCRC32Hash(destPath);
                var newpath = destPath.replace(new RegExp(relpath + '$'), moduleName + '-' + hash + moduleExtname);
                var index = allowHashFileTypes.indexOf(moduleExtname.substring(1));
                var fileType = index > -1 ? allowHashFileTypes[allowHashFileTypes.indexOf(moduleExtname.substring(1))] : '';

                if (fileType === '') {
                    return grunt.log.warn('There\'s sth wrong with source file: "' + destPath + '".');
                } else {
                    hashmap[fileType][moduleName] = hash;

                    console.log('generating hash file: ' + newpath);

                    if (keep) {
                        file.write(newpath, fs.readFileSync(destPath, 'utf8'), 'utf8');
                    } else {
                        fs.renameSync(destPath, newpath);
                    }
                }
            });

        });

        fs.writeFile(mapfile, JSON.stringify(hashmap), 'utf8', function(err) {
            if (err) {
                throw err;
            }

            done();
        });

    });

};