/**
 * A grunt task that replace file content by CRC32 hashes.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');


    var PLACEHOLDER = '<%=imgPath%>';
    var PREFIX_PATH = /<%=staticsServer%>images/g;

    grunt.registerMultiTask('replace', 'replace static paths in files by hashmap', function() {

        var target = this.target;
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
                    if (err) {
                        throw err;
                    }

                    console.log(('replacing: ' + filepath).cyan);

                    // replace images path prefix.
                    var wdata = data.replace(PREFIX_PATH, PLACEHOLDER);

                    if (wdata !== data) {
                        fs.writeFileSync(filepath, wdata, 'utf8');
                    }

                    if (done.index === (sources.length - 1)) {
                        done();
                    } else {
                        done.index++;
                    }
                });

            });

        });

    });
};