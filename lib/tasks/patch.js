/**
 * A grunt task that for project patch.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    // external libs.
    var mkdirp = require('mkdirp');

    // internal libs.
    var log = require('../utils/log');
    var argv = require('../utils/argv');
    var file = require('../utils/file');
    var profileUtil = require('../utils/profile');
    var filemap = require('../common/filemap');

    // task for patch.
    grunt.registerTask('patch', 'A grunt task that for project patch.', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var options = this.options();
        var patchDir = this.args[0]; // the patch path in file system.
        var patchProjectName = argv.get('project'); // patch project name.
        var jshintPath = options.jshintpath;

        if (!file.isDir(patchDir)) {
            return log.error('the patch directory ' + patchDir + ' must be a real path in file system!');
        }


        var changedFiles = {};
        var ROOTDIR_IMG = options.root.img;
        var ROOTDIR_CSS = options.root.css;
        var ROOTDIR_JS = options.root.js;
        var ROOTDIR_JSP = options.root.jsp;

        [ROOTDIR_IMG, ROOTDIR_CSS, ROOTDIR_JS, ROOTDIR_JSP].forEach(function(key) {
            changedFiles[key] = [];
        });

        var TARGET_IMG_CWD = grunt.config('optiimg.files.cwd');
        var TARGET_CSS_CWD = grunt.config('opticss.files.cwd');
        var TARGET_JS_CWD = grunt.config('optijs.files.cwd');
        var TARGET_JSP_CWD = grunt.config('optijsp.files.cwd');


        /**
         * @param  {String} rootdir    "the target root dir."
         * @param  {String} patchDirId "if patch file directory like 'images.market.common', the patchDirId args value passed to the function should be 'market/common'"
         * @param  {String} patchFile  "the real patch file path in the file system."
         */
        function copyPatchFileToSourceDir(rootdir, patchDirId, patchFile) {
            var targetBaseDir = '';
            var targetPatchDirPath;
            var destFile;

            switch (rootdir) {
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

        function getDependsRootdir(identifier) {
            var extname = path.extname(identifier).replace(/^\./, '');
            var rootdir;

            switch (extname) {
                case 'ico':
                case 'gif':
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'ttf':
                case 'woff':
                case 'eot':
                case 'svg':
                    rootdir = ROOTDIR_IMG;
                    break;
                case 'css':
                    rootdir = ROOTDIR_CSS;
                    break;
                case 'js':
                    rootdir = ROOTDIR_JS;
                    break;
                case 'jsp':
                    rootdir = ROOTDIR_JSP;
                    break;
            }

            return rootdir;
        }

        function processDependents() {
            // process order: images --> css --> js
            // there's no static file depends on jsp files.
            [ROOTDIR_IMG, ROOTDIR_CSS, ROOTDIR_JS].forEach(function(key) {
                changedFiles[key].forEach(function(ele, index, array) {
                    // find files which depends on ele.
                    
                    // for windows path style
                    if (path.sep !== '/') {
                        ele = ele.replace(/\\/g, '/');
                    }
                    var dependents = filemap.backtrace(ele);

                    for (var i = dependents.length - 1; i >= 0; i--) {
                        changedFiles[getDependsRootdir(dependents[i])].push(dependents[i]);
                    }
                });
            });
        }

        // for concat task.
        function getConcatTaskConfig() {
            
            var cssProfile = profileUtil.getConcats('css');
            var jsProfile = profileUtil.getConcats('js');

            var toConcatCSS = {};
            var toConcatJS = {};

            function findToConcatFiles(rootdir, toConcat, profile) {
                changedFiles[rootdir].forEach(function(element, index, array) {
                    for (var i in profile) {
                        if (toConcat[i] === undefined && profile[i].indexOf(element) > -1) {
                            toConcat[i] = profile[i];

                            if (changedFiles[rootdir].indexOf(i) === -1) {
                                changedFiles[rootdir].push(i);
                            }
                        }
                    }
                });
            }

            findToConcatFiles(ROOTDIR_CSS, toConcatCSS, cssProfile);
            findToConcatFiles(ROOTDIR_JS, toConcatJS, jsProfile);

            return {
                css: toConcatCSS,
                js: toConcatJS
            };
        }

        /**
         * A little prepare work before starting real patch operation.
         */
        function prePatch() {
            // restore
            function rollback() {
                filemap.restore();
            }

            // backup filemap.
            filemap.backup();

            // Grunt doesn't yet emit any events. this is just fail in log util by now. 
            log.once('error', function(code) {
                if (code !== 0) {
                    rollback();
                }
            });

            // delete jshintPath 
            file.delete(jshintPath);
        }


        fs.readdir(patchDir, function(err, files) {
            if (err) {
                log.error(err.message);
            }

            prePatch();

            var runTasksList = [];

            // filter files to be processd.
            files.forEach(function(ele, index, array) {
                var directoryCollection = ele.split('.');
                var filePath = path.join(patchDir, ele);
                var rootDir;
                var relpath;


                // At the current time in ablesky patch, all js/css/images/jsp patch files has a certain dir prefix (eg. "js.lib" "jsp.includes").
                if (file.isDir(filePath)) {
                    rootDir = directoryCollection.shift();

                    if (rootDir === ROOTDIR_JSP && patchProjectName != undefined) {
                        directoryCollection = directoryCollection.reverse().concat([patchProjectName]).reverse();
                    }

                    relpath = directoryCollection.join('/');


                    if (options.jshint === true && rootDir === ROOTDIR_JS) {
                        // for jshint 
                        fs.readdirSync(filePath).map(function(element) {
                            file.copy(path.join(filePath, element), path.join(jshintPath, relpath, element));
                        });
                    }

                    if (Object.keys(changedFiles).indexOf(rootDir) > -1) {
                        changedFiles[rootDir] = changedFiles[rootDir].concat(fs.readdirSync(filePath).map(function(element) {
                            copyPatchFileToSourceDir(rootDir, relpath, path.join(filePath, element));

                            return path.join(relpath, element);
                        }));
                    }

                    // patch has profile.json in js dir, delete it in changeFile, just copy to source dir.
                    if (rootDir === ROOTDIR_JS && file.exists(path.join(filePath, profileUtil.getFileName()))) {
                        // console.log(changedFiles, rootDir)
                        // var index = changedFiles[rootDir].indexOf(profileUtil.getFileName());
                        // delete changedFiles[rootDir][index];

                        // find profile.json, so reload the config.
                        profileUtil.reloadConfig();
                    }
                }
            });

            // run jshint task
            if (options.jshint === true) {
                grunt.task.run('jshint:develop');
            }

            runTasksList.push('clean');
            processDependents();

            var concatConfig = getConcatTaskConfig();
            var cssCount = Object.keys(concatConfig.css).length;
            var jsCount = Object.keys(concatConfig.js).length;

            if (cssCount > 0 || jsCount > 0) {
                grunt.config('concat.css.files', cssCount > 0 ? concatConfig.css : []);
                grunt.config('concat.js.files', jsCount > 0 ? concatConfig.js : []);

                runTasksList.push('concat');
            }

            // for copy task
            // grunt.config('copy.css.cwd', cssCount > 0 ? concatConfig.css : []);
            // runTasksList.push('copy');

            for (var i in changedFiles) {
                if (changedFiles[i].length > 0) {
                    switch (i) {
                        case ROOTDIR_IMG:
                            grunt.config('optiimg.files.src', grunt.config('optiimg.files.src').filter(function(ele) {
                                // keep rules which no match.
                                return /^!/.test(ele);
                            }).concat(changedFiles[ROOTDIR_IMG]));

                            runTasksList.push('optiimg');
                            break;
                        case ROOTDIR_CSS:
                            grunt.config('opticss.files.src', grunt.config('opticss.files.src').filter(function(ele) {
                                // keep rules which no match.
                                return /^!/.test(ele);
                            }).concat(changedFiles[ROOTDIR_CSS]));

                            runTasksList.push('opticss');
                            break;
                        case ROOTDIR_JS:
                            grunt.config('optijs.files.src', grunt.config('optijs.files.src').filter(function(ele) {
                                // keep rules which no match.
                                return /^!/.test(ele);
                            }).concat(changedFiles[ROOTDIR_JS]));

                            runTasksList.push('optijs');
                            break;
                        case ROOTDIR_JSP:
                            grunt.config('optijsp.files.src', changedFiles[ROOTDIR_JSP]);
                            runTasksList.push('optijsp');
                            break;
                    }
                }
            }

            // runTasksList.push('shell');
            runTasksList.push('chrono');

            grunt.task.run(runTasksList);

            done();
        });

    });
};