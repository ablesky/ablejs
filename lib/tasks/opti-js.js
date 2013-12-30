/**
 * A grunt task that for optimize js/swf files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var jsbin = require('../utils/jsbin');
    var filemap = require('../common/filemap');


    grunt.registerMultiTask('optijs', 'A grunt task that for optimize js/swf files.', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var options = this.options();
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
                var sourceType = sourceExtname.replace(/^./, '');
                var resultPath, map;

                function next() {
                    log.write('result ' + sourceType + ': ' + resultPath.data + ' ...');
                    log.info('ok');
                    setTimeout(recursiveSource, 0);
                }

                if (!file.exists(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, file.read(sourcePath));

                    log.write('source ' + sourceType + ': ' + sourcePath.data + '\n');

                    options.onBuildRead = function(moduleName, path, contents) {
                        // replace depends in content.
                        return filemap.processDepends(contents, map.dependencies);
                    };

                    switch (sourceType) {
                        case 'swf':
                            // the file to be generated in dest dir.
                            resultPath = path.join(dest, sourceIdentifier);
                            file.copy(sourcePath, resultPath);
                            next();
                            break;
                        case 'js':
                            resultPath = path.join(dest, map.fingerprint + sourceExtname);
                            jsbin.optimize(sourcePath, resultPath, sourceIdentifier.replace(new RegExp(sourceExtname + '$'), ''), options, function() {
                                next();
                            });
                            break;
                    }
                }
            })();

        });
    });

};