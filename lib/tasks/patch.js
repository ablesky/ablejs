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
        var patchDir = this.args[0]; // the patch path in file system..
        var patchProjectName = argv.get('project'); // patch project name.

        if (!file.isDir(patchDir)) {
            log.error('the patch directory ' + patchDir + ' must be a real path in file system!');
            return done();
        }

        var jshintDevDir = 'dist/jshintDev/';

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
                case 'gif':
                case 'png':
                case 'jpg':
                case 'jpeg':
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

        function processDependons() {
            // process order: images --> css --> js
            // there's no static file depends on jsp files.
            [ROOTDIR_IMG, ROOTDIR_CSS, ROOTDIR_JS].forEach(function(key) {
                changedFiles[key].forEach(function(ele, index, array) {
                    var dependons = filemap.backtrace(ele);

                    for (var i = dependons.length - 1; i >= 0; i--) {
                        changedFiles[getDependsRootdir(dependons[i])].push(dependons[i]);
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

        // delete jshintDevDir 
        file.delete(jshintDevDir);

        fs.readdir(patchDir, function(err, files) {
            if (err) {
                log.error(err.message);
            }

            var runTasksList = [];
            // var jsBaseDir = grunt.config('optijs.files.cwd');

            files.forEach(function(ele, index, array) {
                var directoryCollection = ele.split('.');
                var filePath = path.join(patchDir, ele);
                var rootDir;
                var relpath;


                // At the current time in ablesky, all js/css/images/jsp patch files has a certain dir prefix (eg. "js.lib" "jsp.includes").
                if (file.isDir(filePath)) {
                    rootDir = directoryCollection.shift();

                    if (rootDir === ROOTDIR_JSP) {
                        directoryCollection = directoryCollection.reverse().concat([patchProjectName]).reverse();
                    }

                    relpath = directoryCollection.join('/');

                    
                    if(rootDir === ROOTDIR_JS){

                    	// for jshint 
                    	fs.readdirSync(filePath).map(function(element){
                    		file.copy( filePath+'/'+element, jshintDevDir+relpath + '/' + element);
                    	});
                    	
                    }

                    if (Object.keys(changedFiles).indexOf(rootDir) > -1) {
                        changedFiles[rootDir] = changedFiles[rootDir].concat(fs.readdirSync(filePath).map(function(element) {
                            copyPatchFileToSourceDir(rootDir, relpath, path.join(filePath, element));

                            return path.join(relpath, element);
                        }));
                    }
                }
            });

           	// run jshint task
            if (options.jshint === true) {
                grunt.task.run('jshint:develop');
            }


            grunt.task.run(['clean']);
            processDependons();

            var concatConfig = getConcatTaskConfig();
            var cssCount = Object.keys(concatConfig.css).length;
            var jsCount = Object.keys(concatConfig.js).length;

            if (cssCount > 0 || jsCount > 0) {
                grunt.config('concat.css.files', cssCount > 0 ? concatConfig.css : []);
                grunt.config('concat.js.files', jsCount > 0 ? concatConfig.js : []);

                runTasksList.push('concat');
            }

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

            // runTasksList.push('shell');
            runTasksList.push('chrono');

            grunt.task.run(runTasksList);

            done();
        });

    });
};