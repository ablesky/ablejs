/**
 * A grunt task that for project patch.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var path = require('path');
    var fs = require('fs');

    // internal libs.
    var log = require('../utils/log');

    function processIMG(data) {

        return data;
    }

    // task for build.
    // var runs = grunt.task.run(['concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);

    grunt.registerMultiTask('patch', 'task for project patch', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var tally = {
            files: 0
        };

        this.files.forEach(function(element) {

            var cwd = element.cwd;
            var dest = element.dest;

            element.src.forEach(function(relpath) {
                var srcPath = path.join(cwd, relpath);
                var destPath = path.join(dest, relpath);

                if (!fs.existsSync(srcPath)) {
                    return log.warn('Source file "' + srcPath + '" not found.');
                }

                fs.readFile(srcPath, function(err, data) {
                    if (err) throw err;

                    log.writeln('Patching ' + srcPath.cyan + ' -> ' + destPath.cyan);

                    var wdata = '';

                    switch (target) {
                        case 'img':
                            wdata = processIMG(data);
                            break;
                        case 'css':
                            wdata = processCSS(data);
                            break;
                        case 'js':
                            wdata = processJS(data);
                            break;
                        case 'jsp':
                            wdata = processJSP(data);
                            break;
                        default: 
                            log.error('target type error!');
                    }


                    log.writeln(wdata);
                });

                // grunt.file.copy(srcPath, destPath, 'utf8');
                // tally.files++;
            });
        });

        // if (tally.files) {
        //     log.writeln((tally.dirs ? ', copied ' : 'Copied ') + tally.files.toString().cyan + ' files');
        // }
    });
};