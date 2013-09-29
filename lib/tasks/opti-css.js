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

    grunt.registerMultiTask('opticss', 'Optimize css files', function() {
        var options = this.options();
        var cwd = this.data.cwd;
        var dest = this.data.dest;

        this.files.forEach(function(element, i, array) {
            element.src.forEach(function(sourceIdentifier) {

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