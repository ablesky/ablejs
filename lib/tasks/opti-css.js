/**
 * A grunt task that for optimize css files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');

    // internal libs.
    var file = require('../utils/file');
    var log = require('../utils/log');
    var cssbin = require('../utils/cssbin');
    var filemap = require('../common/filemap');

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

    grunt.registerMultiTask('opticss', 'A grunt task that for optimize css files.', function() {
        var options = this.options();
        var cwd = this.data.cwd;
        var dest = this.data.dest;

        this.files.forEach(function(element, i, array) {
            element.src.forEach(function(sourceIdentifier) {

                var sourcePath = path.join(cwd, sourceIdentifier);
                var sourceExtname = path.extname(sourcePath);
                var sourceContent, resultPath, map, minified;

                if (!file.exists(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    log.write('source css: ' + sourcePath.data + '\n');

                    sourceContent = preProcessSourceContent(file.read(sourcePath));
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, sourceContent);
                }

            });

            filemap.save();
        });

    });

};