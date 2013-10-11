/**
 * A grunt task that for project patch.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    var path = require('path');

    // external libs.
    var mkdirp = require('mkdirp');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var dependency = require('../utils/dependency');

    // task for patch.
    grunt.registerTask('patch', 'task for project patch', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var options = this.options();
        var patchdir = this.args[0];

        if (!file.isDir(patchdir)) {
            log.error(patchdir + ' must be a directory!');
            return done();
        }

        var changedFiles = {};

        var ROOTDIR_IMG = options.root.img,
            ROOTDIR_CSS = options.root.css,
            ROOTDIR_JS = options.root.js,
            ROOTDIR_JSP = options.root.jsp;

        var TARGET_IMG_CWD = grunt.config('optiimg.files.cwd'),
            TARGET_CSS_CWD = grunt.config('opticss.files.cwd'),
            TARGET_JS_CWD = grunt.config('optijs.files.cwd'),
            TARGET_JSP_CWD = grunt.config('optijsp.files.cwd');

        changedFiles[ROOTDIR_IMG] = [];
        changedFiles[ROOTDIR_CSS] = [];
        changedFiles[ROOTDIR_JS] = [];
        changedFiles[ROOTDIR_JSP] = [];

        /**
         * @param  {String} taskTarget "the task target name"
         * @param  {String} patchDirId "if patch file directory like 'images.market.common', patchDirId will be 'market/common'"
         * @param  {String} patchFile  "the real patch file path in the os."
         */
        function copyPatchFileToSourceDir(taskTarget, patchDirId, patchFile) {
            var targetBaseDir = '';
            var targetPatchDirPath;
            var destFile;

            switch (taskTarget) {
                case ROOTDIR_IMG:
                    targetBaseDir = TARGET_IMG_CWD;
                    break;
                case ROOTDIR_CSS:
                    targetBaseDir = TARGET_CSS_CWD;
                    break;
                case ROOTDIR_JS:
                    targetBaseDir = TARGET_JS_CWD;
                    break;
                case ROOTDIR_JSP:
                    targetBaseDir = TARGET_JSP_CWD;
                    break;
            }

            if (targetBaseDir) {
                targetPatchDirPath = path.join(targetBaseDir, patchDirId);
                mkdirp.sync(targetPatchDirPath);

                destFile = path.join(targetPatchDirPath, path.basename(patchFile));
                file.copy(patchFile, destFile);
            }
        }

        fs.readdir(patchdir, function(err, files) {
            if (err) {
                log.error(err.message);
            }

            var runTasksList = [];

            files.forEach(function(ele, index, array) {
                var filePath = path.join(patchdir, ele);
                var rootDir;
                var relpath;

                if (file.isDir(filePath)) {
                    relpath = ele.split('.').slice(1).join('/');
                    rootDir = ele.split('.')[0];

                    if (Object.keys(changedFiles).indexOf(rootDir) > -1) {
                        changedFiles[rootDir] = changedFiles[rootDir].concat(fs.readdirSync(filePath).map(function(element) {
                            copyPatchFileToSourceDir(rootDir, relpath, path.join(filePath, element));

                            return path.join(relpath, element);
                        }));
                    }
                }
            });

            for (var i in changedFiles) {
                if (changedFiles[i].length > 0) {
                    switch (i) {
                        case ROOTDIR_IMG:
                            grunt.config('optiimg.files.src', changedFiles[ROOTDIR_IMG]);
                            runTasksList.push('optiimg');
                            break;
                        case ROOTDIR_CSS:
                            grunt.config('opticss.files.src', changedFiles[ROOTDIR_CSS]);
                            runTasksList.push('opticss');
                            break;
                        case ROOTDIR_JS:
                            grunt.config('optijs.files.src', changedFiles[ROOTDIR_JS]);
                            runTasksList.push('optijs');
                            break;
                        case ROOTDIR_JSP:
                            grunt.config('optijsp.files.src', changedFiles[ROOTDIR_JSP]);
                            runTasksList.push('optijsp');
                            break;
                    }
                }

            }

            grunt.task.run(runTasksList);

            done();
        });

    });
};