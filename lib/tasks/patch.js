/**
 * A grunt task that for project patch.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var spawn = require('child_process').spawn,
    var fs = require('fs');
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var dependency = require('../utils/dependency');


    console.log(Date.now());

    // task for patch.
    grunt.registerTask('patch', 'task for project patch', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var patchdir = this.args[0];

        if (!file.isDir(patchdir)) {
            log.error(patchdir + ' must be a directory!');
            return done();
        }

        var changedFiles = {};
        var TARGET_IMG = 'images',
            TARGET_CSS = 'css',
            TARGET_JS = 'js',
            TARGET_JSP = 'jsp';

        changedFiles[TARGET_IMG] = [];
        changedFiles[TARGET_CSS] = [];
        changedFiles[TARGET_JS] = [];
        changedFiles[TARGET_JSP] = [];

        fs.readdir(patchdir, function(err, files) {
            if (err) {
                log.error(err.message);
            }

            files.forEach(function(ele, index, array) {
                var filePath = path.join(patchdir, ele);
                var rootDir;
                var target, relpath;

                if (file.isDir(filePath)) {
                    relpath = ele.split('.').slice(1).join('/');
                    rootDir = ele.split('.')[0];

                    if (Object.keys(changedFiles).indexOf(rootDir) > -1) {
                        target = rootDir;

                        changedFiles[target] = changedFiles[target].concat(fs.readdirSync(filePath).map(function(element) {
                            return path.join(relpath, element);
                        }));
                    }
                }
            });

            console.log(changedFiles);

            grunt.config('optiimg.files.src', changedFiles[TARGET_IMG]);
            grunt.config('opticss.files.src', changedFiles[TARGET_CSS]);
            grunt.config('optijs.files.src', changedFiles[TARGET_JS]);
            grunt.config('optijsp.files.src', changedFiles[TARGET_JSP]);

            grunt.task.run(['optiimg', 'opticss', 'optijs', 'optijsp'], done);

            // grunt.util.spawn({
            //     // Spawn with the grunt bin
            //     grunt: true,
            //     // Run from current working dir and inherit stdio from process
            //     opts: {
            //         cwd: __dirname,
            //         stdio: 'inherit',
            //     },
            //     // Run grunt this process uses, append the task to be run and any cli options
            //     args: ['optiimg', 'opticss', 'optijs', 'optijsp'],
            // }, function(err, res, code) {
            //     // Spawn is done
            //     done();
            // });
        });

    });
};