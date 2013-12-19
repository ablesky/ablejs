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

                if (!file.exists(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, file.read(sourcePath));
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, map.fingerprint + sourceExtname);

                    log.write('source ' + sourceType + ': ' + sourcePath.data + '\n');
                    log.write('result ' + sourceType + ': ' + resultPath.data + ' ...');

                    options.onBuildRead = function(moduleName, path, contents) {
                        // replace dependens in content.
                        return filemap.processDepends(contents, map.dependencies);
                    };

                    jsbin.optimize(sourcePath, resultPath, sourceIdentifier.replace(new RegExp(sourceExtname + '$'), ''), options, function() {
                        log.info('ok');
                        setTimeout(recursiveSource, 0);
                    });

                }
            })();

        });
    });

};