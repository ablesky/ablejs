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
    var imgbin = require('../utils/imgbin');
    var dependency = require('../utils/dependency');

    function processIMG(data) {

        return data;
    }

    // task for build.
    // var runs = grunt.task.run(['concat', 'requirejs', 'uglifyJS', 'minifyCSS', 'shell', 'logs']);

    grunt.registerTask('patch', 'task for project patch', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();

        var tally = {
            files: 0
        };

        this.files.forEach(function(element) {

            var cwd = element.cwd;
            var dest = element.dest;

            var sources = element.src;

            (function recursiveSource() {

                var relpath = sources.shift();
                var srcPath = path.join(cwd, relpath);
                var destPath = path.join(dest, relpath);
                var fileType = path.extname(relpath).replace(/^\./, '');

                if (!fs.existsSync(srcPath)) {
                    return log.warn('Source file "' + srcPath + '" not found.');
                }

                if (fileType === 'gif' || fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg') {
                    imgbin.optimize(srcPath, destPath, function() {
                        
                        // TODO fingerprint

                        recursiveSource();
                    });
                } else {
                    fs.readFile(srcPath, function(err, data) {
                        if (err) throw err;

                        log.info('Patching ' + srcPath.cyan + ' -> ' + destPath.cyan);

                        var wdata = '';

                        switch (fileType) {
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
                                log.error('file type error!');
                        }


                        log.info(wdata);
                    });
                }


            })();



        });

        // if (tally.files) {
        //     log.info((tally.dirs ? ', copied ' : 'Copied ') + tally.files.toString().cyan + ' files');
        // }
    });
};