/**
 * A grunt task that for optimize jsp/html files.
 */

module.exports = function(grunt) {
    'use strict';

    // node libs.
    var fs = require('fs');
    var path = require('path');

    // internal libs.
    var log = require('../utils/log');
    var file = require('../utils/file');
    var jsbin = require('../utils/jsbin');
    var profile = require('../utils/profile');
    var dependency = require('../utils/dependency');
    var filemap = require('../common/filemap');
    var amdModules = require('../common/modules');


    grunt.registerMultiTask('optijsp', 'A grunt task that for optimize jsp/html files.', function() {

        // Force task into async mode and grab a handle to the "done" function.
        var done = this.async();
        var options = this.options();
        var cwd = this.data.cwd;
        var dest = this.data.dest;
        var jsBasePath = options.jsBasePath;
        var jsProfile = profile.getConcats('js', jsBasePath);
        var gexcludes = dependency.findNested(jsBasePath, amdModules.gid);
        gexcludes.push(amdModules.gid);

        var placeholderExpr = /\$ablejs[\s]+placeholder[\s]+-[\s]+[\w\W]+\$/ig;
        var headCloseTagExpr = /<\/head\s*>/ig;
        var jspPageEncodeExpr = /<\%@\s+page[\w\W]+pageEncoding\s*=[\w\W]+\%>/g;

        function getExtname(p) {
            return path.extname(p).replace(/^\./, '').toLowerCase();
        }

        function filemapTemplate(modules) {
            var ret = {};

            modules.forEach(function(identifier) {
                identifier = identifier.replace(/\.js$/, '');

                var map = filemap.get(identifier + '.js');
                if (map !== undefined) {
                    ret[identifier] = map.fingerprint;
                }
            });

            return Object.keys(ret).length > 0 ? '<script type="text/javascript">require.config({paths: ' + JSON.stringify(ret) + '});</script>' : '';
        }

        this.files.forEach(function(element, i, array) {
            var sources = element.src;

            (function recursiveSource() {
                var sourceIdentifier = sources.shift();

                if (!sourceIdentifier) {
                    filemap.save();
                    // end task.
                    return done();
                }

                var sourcePath = path.join(cwd, sourceIdentifier);
                var sourceContent, resultPath, map;
                var amdjsCollection = [],
                    nestedCollection = [];

                if (!fs.existsSync(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    sourceContent = file.read(sourcePath);
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, sourceContent);
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, sourceIdentifier);
                    // replace dependency in content.
                    sourceContent = filemap.processDepends(sourceContent, map.dependencies);

                    // handle AMD module in jsp file. -- require['page/module']
                    var amdjsCollection = map.dependencies.filter(function(element, index, array) {
                        var fileType = getExtname(element);
                        var filePath = path.join(jsBasePath, element);

                        return fileType === 'js' && jsProfile[filePath] == null && file.exists(filePath) && gexcludes.indexOf(element.replace(path.extname(element), '')) === -1 && jsbin.isAMD(file.read(filePath));
                    }).forEach(function(identifier, index, array) {
                        nestedCollection = nestedCollection.concat(dependency.findNested(jsBasePath, identifier));
                        nestedCollection.push(identifier);
                    });

                    nestedCollection = nestedCollection.filter(function(element) {
                        return gexcludes.indexOf(element) === -1;
                    });

                    filemap.addAmdDepends(sourceIdentifier, nestedCollection);

                    var jspRelativeName = sourceIdentifier.split('.').slice(1).join('.');
                    log.debug(sourceIdentifier, jspRelativeName);
                    if (jspRelativeName = 'includes/head-content.jsp') {
                        log.debug(1);
                        // jsp file is head-content.jsp
                        sourceContent += filemapTemplate(gexcludes);
                    } else if (jspRelativeName == 'head.jsp' || jspRelativeName == 'includes/global.jsp') {
                        log.debug(2);
                        // nothing to do
                    } else if (headCloseTagExpr.test(sourceContent)) {
                        log.debug(3);
                        headCloseTagExpr.lastIndex = 0;
                        console.log(filemapTemplate(nestedCollection) + '</head>')
                        // the page content has </head> closed tag.
                        sourceContent = sourceContent.replace(headCloseTagExpr, filemapTemplate(nestedCollection) + '\n</head>');
                    } else if (jspPageEncodeExpr.test(sourceContent)) {
                        log.debug(4);
                        // every jsp file has pageEncoding directives.
                        var substr = sourceContent.substring(0, jspPageEncodeExpr.lastIndex);
                        sourceContent = sourceContent.replace(substr, substr + filemapTemplate(nestedCollection));
                    }


                    log.write('source jsp: ' + sourcePath.data + '\n');
                    log.write('result jsp: ' + resultPath.data + ' ...');

                    file.write(resultPath, sourceContent);
                    log.info('ok');
                    setTimeout(recursiveSource, 0);
                }
            })();

        });
    });

};