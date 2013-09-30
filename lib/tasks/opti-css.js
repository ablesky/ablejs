/**
 * A grunt task that optimize css files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');
    var fs = require('fs');

    // internal libs.
    var file = require('../utils/file');
    var log = require('../utils/log');
    var dependency = require('../utils/dependency');
    var filemap = require('../utils/filemap');
    var cssbin = require('../utils/cssbin');

    var rmultilineCommentsExpr = /\/\*(?!\!)([\s\S]*?)\*\//g;

    var CSS_PLACEHOLDER = '%IMG_PATH%';
    var CSS_PREFIX_PATH = 'http://www.ablesky-a.com:8080/ableskystatics/images/';

    /**
     * CSS_PLACEHOLDER <--> CSS_PREFIX_PATH
     */
    function replacePicPrefixInCSS(content, isReversed) {
        return content.replace(new RegExp(isReversed ? CSS_PLACEHOLDER : CSS_PREFIX_PATH, 'g'), isReversed ? CSS_PREFIX_PATH : CSS_PLACEHOLDER);
    }

    function preProcessSourceContent(data) {
        // replace images path prefix.
        return replacePicPrefixInCSS(data.replace(rmultilineCommentsExpr, ''), false);
    }

    grunt.registerMultiTask('opticss', 'Optimize css files', function() {
        var options = this.options();
        var cwd = this.data.cwd;
        var dest = this.data.dest;

        this.files.forEach(function(element, i, array) {
            element.src.forEach(function(sourceIdentifier) {

                var sourcePath = path.join(cwd, sourceIdentifier);
                var sourceExtname = path.extname(sourcePath);
                var sourceContent, resultPath, map, minified;

                if (!fs.existsSync(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    log.info('source css: ' + sourcePath.yellow);

                    sourceContent = preProcessSourceContent(file.read(sourcePath));
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, sourceContent);
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, map.fingerprint + sourceExtname);
                    // replace dependency in content.
                    sourceContent = dependency.process(sourceContent, map.dependencies, filemap.getAll());
                    // recovery previous img path replace.
                    sourceContent = replacePicPrefixInCSS(sourceContent, true);

                    // compress file content.
                    minified = cssbin.minify(sourceContent, {
                        relativeTo: path.dirname(sourcePath) // to resolve relative @import rules
                    });

                    if (options.banner) {
                        minified = options.banner + minified;
                    }

                    file.write(resultPath, minified);

                    log.info('result css: ' + resultPath.yellow + '\n');
                }

            });

            filemap.save();
        });

    });

};