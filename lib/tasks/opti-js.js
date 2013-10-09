/**
 * A grunt task that optimize js files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    // external libs.
    var madge = require('madge');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var dependency = require('../utils/dependency');
    var filemap = require('../utils/filemap');
    var jsbin = require('../utils/jsbin');


    grunt.registerMultiTask('optijs', 'Optimize JS files', function() {

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
                var resultPath, map, minified;

                if (!fs.existsSync(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, file.read(sourcePath));
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, map.fingerprint + sourceExtname);
                    
                    options.onBuildRead = function(moduleName, path, contents) {
                        // replace dependency in content.
                        return dependency.process(contents, map.dependencies, filemap.getAll());
                    };

                    log.write('source js: ' + sourcePath.yellow + '\n');
                    log.write('result js: ' + resultPath.yellow + ' ...');

                    jsbin.optimize(sourcePath, resultPath, sourceIdentifier.replace(new RegExp(sourceExtname + '$'), ''), options, function() {
                        log.info('ok\n');
                        setTimeout(recursiveSource, 0);
                    });
                }
            })();

        });
    });

};