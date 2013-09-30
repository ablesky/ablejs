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
    var file = require('../utils/file');
    var log = require('../utils/log');
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
                var sourcePath = path.join(cwd, sourceIdentifier);
                var sourceExtname = path.extname(sourcePath);
                var sourceContent, resultPath, map, minified;

                if (!fs.existsSync(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    log.info('source js: ' + sourcePath.yellow);

                    sourceContent = file.read(sourcePath);
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, sourceContent);
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, map.fingerprint + sourceExtname);
                    // replace dependency in content.
                    sourceContent = dependency.process(sourceContent, map.dependencies, filemap.getAll());

                    jsbin.optimize(sourcePath, resultPath, sourceIdentifier.replace(new RegExp(sourceExtname + '$'), ''), options, recursiveSource);
                }
            })();

        });
    });

};