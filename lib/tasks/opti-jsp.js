/**
 * A grunt task that optimize jsp/html files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var dependency = require('../utils/dependency');
    var filemap = require('../utils/filemap');


    grunt.registerMultiTask('optijsp', 'Optimize jsp/html files', function() {

        // Force task into async mode and grab a handle to the "done" function.
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
                var sourceContent, resultPath, map;

                if (!fs.existsSync(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    sourceContent = file.read(sourcePath);
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, file.read(sourcePath));
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, sourceIdentifier);
                    // replace dependency in content.
                    sourceContent = dependency.process(sourceContent, map.dependencies, filemap.getAll());

                    log.write('source jsp: ' + sourcePath.yellow + '\n');
                    log.write('result jsp: ' + resultPath.yellow + ' ...');

                    file.write(resultPath, sourceContent);
                    log.info('ok');
                    setTimeout(recursiveSource, 0);
                }
            })();

        });
    });

};
