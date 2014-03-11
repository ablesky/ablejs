/**
 * utils - soucemap.
 */

'use strict';

// external libs.
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var SourceMapGenerator = require('source-map').SourceMapGenerator;
var SourceNode = require('source-map').SourceNode;



exports.generate = function(sourceFile, targetFile) {
    var map = new SourceMapGenerator({
        file: sourceFile
    });

    console.log(map);
    return

    map.addMapping({
        generated: {
            line: 3,
            column: 35
        },
        source: sourceFile,
        original: {
            line: 33,
            column: 2
        },
        name: "christopher"
    });

    return {
        sourceUrlLine: '//# sourceURL=<url>',
        sourceMapLine: '//# sourceMappingURL=<url>',
        map: map.toString()
    };
};