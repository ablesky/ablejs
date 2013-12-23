/**
 * A grunt task that for copy files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');

    grunt.registerMultiTask('copy', 'A grunt task that for copy files and folders.', function() {
        // var options = this.options();
        var cwd = this.data.cwd;
        var dest = this.data.dest;

        this.files.forEach(function(element) {
            element.src.forEach(function(src) {
                var sourcePath = path.join(cwd, src);
                var resultPath = path.join(dest, src);

                log.write('Copy ' + (src + '...').info);

                file.copy(sourcePath, resultPath);
                log.info('ok');
            });
        });

    });

};