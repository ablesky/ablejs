/**
 * A grunt task that for optimize image files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');
    var fs = require('fs');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var imgbin = require('../utils/imgbin');
    var filemap = require('../common/filemap');

    grunt.registerMultiTask('optiimg', 'A grunt task that for optimize image files.', function() {
        // force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var cwd = this.data.cwd;
        var dest = this.data.dest;

        this.files.forEach(function(element, i, array) {
            var sources = element.src;

            (function recursiveSource() {
                var sourceIdentifier = sources.shift();

                if (!sourceIdentifier) {
                    filemap.save();
                    // end task.
                    return done();
                }

                var sourcePath = path.join(cwd, sourceIdentifier);
                var sourceExtname = path.extname(sourcePath);
                var sourceContent = file.read(sourcePath, 'ascii');
                var map, resultPath;

                if (!fs.existsSync(sourcePath)) {
                    log.warn(('source file "' + sourcePath + '" not found.').red + ' \n');
                } else {
                    map = filemap.updateMap(sourceIdentifier, sourceContent);
                    resultPath = path.join(dest, map.fingerprint + sourceExtname);

                    log.info('source image: ' + sourcePath.data);
                    log.info('result image: ' + resultPath.data);

                    imgbin.optimize(sourcePath, resultPath, function() {
                        setTimeout(recursiveSource, 0);
                    });
                }
            })();
        });

    });

};