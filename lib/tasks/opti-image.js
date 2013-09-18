/**
 * A grunt task that optimize image files by using node package
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');
    var fs = require('fs');

    // internal libs.
    var log = require('../utils/log');
    var imgbin = require('../utils/imgbin');

    grunt.registerMultiTask('optiIMG', 'Optimize images', function() {

        // force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var cwdbase = this.data.cwd;
        var destbase = this.data.dest;

        this.files.forEach(function(element, i, array) {

            var sources = element.src;

            function recursiveSource() {
                var fileRelPath = sources.shift();

                if (!fileRelPath) {
                    // end task.
                    return done();
                }

                var sourceFile = path.join(cwdbase, fileRelPath);
                var resultFile = path.join(destbase, fileRelPath);

                if (!fs.existsSync(sourceFile)) {
                    log.warn(('source file "' + sourceFile + '" not found.').red + ' \n');
                } else {
                    log.info('source image: ' + sourceFile.yellow);
                    log.info('result image: ' + resultFile.yellow);

                    imgbin.optimize(sourceFile, resultFile, recursiveSource);
                }
            }

            recursiveSource();
        });


    });

};