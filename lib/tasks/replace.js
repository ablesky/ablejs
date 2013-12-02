/**
 * A grunt task that for replace file content.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');

    grunt.registerMultiTask('replace', 'A grunt task that for replace file content.', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        done.index = 0;

        this.files.forEach(function(element, i, array) {

            var basedir = element.cwd;
            var sources = element.src;

            var toreplace = element.toreplace;
            var newstring = element.newstring;

            sources.forEach(function(relpath, i, array) {
                var filepath = path.join(basedir, relpath);

                if (!fs.existsSync(filepath)) {
                    return log.warn('Source file "' + filepath + '" not found.');
                }

                fs.readFile(filepath, 'utf8', function(err, data) {
                    if (err) {
                        throw err;
                    }

                    log.info(('replacing: ' + filepath).cyan);

                    // replace images path prefix.
                    var wdata = data.replace(toreplace, newstring);

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
