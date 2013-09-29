/**
 * A grunt task that optimize js files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');

    // internal libs.
    var file = require('../utils/file');
    var log = require('../utils/log');
    var dependency = require('../utils/dependency');
    var filemap = require('../utils/filemap');
    var jsbin = require('../utils/jsbin');


    grunt.registerMultiTask('optijs', 'Optimize JS files', function() {

        var options = this.options();
        var cwd = this.data.cwd;
        var dest = this.data.dest;

        this.files.forEach(function(element, i, array) {

            var sourcePath = path.join(cwd, sourceIdentifier);
            var sourceExtname = path.extname(sourcePath);
            var sourceContent = file.read(sourcePath);
            var minified, map, resultPath;

            if (!fs.existsSync(sourcePath)) {
                log.warn('Source file "' + sourcePath + '" not found.');
            } else {
                log.info('source css: ' + sourcePath.yellow);

                // replace images path prefix.
                sourceContent = replacePicPrefixInCSS(sourceContent.replace(rmultilineCommentsExpr, ''), false);
                map = filemap.updateMap(sourceIdentifier, sourceContent);

                resultPath = path.join(dest, map.fingerprint + sourceExtname);
                sourceContent = dependency.process(sourceContent, map.dependencies, filemap.getAll());

                // recovery previous replace.
                sourceContent = replacePicPrefixInCSS(sourceContent, true);

                minified = jsbin.uglify(sourceContent, {
                    relativeTo: path.dirname(sourcePath) // to resolve relative @import rules
                });

                if (options.banner) {
                    minified = options.banner + minified;
                }

                file.write(resultPath, minified);

                log.info('result css: ' + resultPath.yellow + '\n');
            }

        });
    });

};