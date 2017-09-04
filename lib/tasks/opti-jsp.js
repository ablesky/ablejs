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
    var argv = require('../utils/argv');
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

        var patchProjectName = argv.get('project'); // patch project name.
        var jsBasePath = options.jsBasePath;
        var jsProfile = profile.getConcats('js', jsBasePath);
        var gexcludes = dependency.findNested(jsBasePath, amdModules.gid).concat(amdModules.gincludes);
        gexcludes.push(amdModules.gid);

        gexcludes = gexcludes.filter(function(ele, index, array) {
            // rm duplicated element in this array.
            return array.indexOf(ele) === index;
        });

        var requireExpr = /[^.]\s*require\s*\(\s*\[(\s*.+\s*)\]\s*/g;
        var headCloseTagExpr = /(<\/head\s*>)/ig;
        var scriptTagExpr = /\s*(<script\s*.+>)/;

        function getExtname(p) {
            return path.extname(p).replace(/^\./, '').toLowerCase();
        }

        /**
         * generate amd module routers template, by require.config({paths: {}});
         * @param  {Array} modules "AMD modules array"
         * @return {String}        "template"
         */
        function filemapTmpl(modules, type) {
            var ret = {},
                retStr = '',
                scriptTpl = '';

            modules.forEach(function(identifier) {
                identifier = identifier.replace(/\.js$/, '');

                var map = filemap.get(identifier + '.js');
                if (map !== undefined) {
                    ret[identifier] = map.fingerprint;
                }
            });

            retStr = JSON.stringify(ret);

            // mobile web app
            if (type !== 'mobile') {
                scriptTpl = '<script type="text/javascript">require.config({paths: ' + retStr + '});</script>';
            } else {
                scriptTpl = '<script>require.source('+ retStr +');</script>';
            }

            return Object.keys(ret).length > 0 ? scriptTpl : '';
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
                var nestedCollection = [];

                if (!fs.existsSync(sourcePath)) {
                    log.warn('Source file "' + sourcePath + '" not found.');
                } else {
                    log.write('source jsp: ' + sourcePath.data + '\n');

                    sourceContent = file.read(sourcePath);
                    // the identifier key's value in "filemap" object.
                    map = filemap.updateMap(sourceIdentifier, sourceContent);
                    // the file to be generated in dest dir.
                    resultPath = path.join(dest, sourceIdentifier);
                    // replace dependency in content.
                    sourceContent = filemap.processDepends(sourceContent, map.dependencies);

                    log.debug('------------------------------------------------');
                    // --------------------------------------------------------
                    // handle AMD module in jsp file. like --> require['page/module'];
                    var deps;
                    requireExpr.lastIndex = 0; // reset reg lastIndex.
                    if ((deps = requireExpr.exec(sourceContent)) !== null) {
                        deps = deps[1].split(',').map(function(ele) {
                            return ele.replace(/[\s'"]/g, '');
                        });

                        filemap.addAmdDepends(sourceIdentifier, deps);
                    }
                    // --------------------------------------------------------

                    log.debug('current jsp dependencies: ' + filemap.get(sourceIdentifier).dependencies);
                    filemap.get(sourceIdentifier).dependencies.filter(function(element, index, array) {
                        var fileType = getExtname(element);
                        var filePath = path.join(jsBasePath, element);

                        if(fileType === 'js'){
                            log.debug(element, index, filePath, fileType, jsProfile[filePath], file.exists(filePath), file.exists(filePath) && jsbin.isAMD(file.read(filePath)));
                        }

                        // for mobile webapp
                        return fileType === 'js' && jsProfile[filePath] == null && file.exists(filePath) &&
                               gexcludes.indexOf(element.replace(path.extname(element), '')) === -1 &&
                               (jsbin.isAMD(file.read(filePath)) || /^mobile\//.test(element));
                    
                    }).forEach(function(identifier, index, array) {
                        // log.debug(identifier);
                        nestedCollection = nestedCollection.concat(dependency.findNested(jsBasePath, identifier));
                        nestedCollection.push(identifier);
                    });

                    //console.log('!', sourceIdentifier, nestedCollection);

                    nestedCollection = nestedCollection.filter(function(element, index, array) {
                        // remove the module which in global modules
                        return array.indexOf(element) === index && gexcludes.indexOf(element) === -1;
                    });

                    // find amd module nest deps, add them to filemap.
                    filemap.addAmdDepends(sourceIdentifier, nestedCollection);

                    var jspRelativeName = sourceIdentifier.split('/').slice(1).join('/');
                    var ignoreList = ['includes/global.jsp', 'head.jsp'];
                    var publicjsList = ['includes/head-content.jsp', 'includeJS.jsp'];
                    log.debug(sourceIdentifier, jspRelativeName);

                    // replace double quotes to single quotes in jsp content, in case of tomcat 7 jsp JasperException.
                    sourceContent = sourceContent.replace(/value\s*=\s*\"\s*<%=\s*request.getParameter(\(.*\))\s*%>\s*\"/g, 'value=\'<%=request.getParameter$1%>\'');
                    
                    if (ignoreList.indexOf(sourceIdentifier) > -1 || ignoreList.indexOf(jspRelativeName) > -1) {
                        log.debug(1);
                        // nothing to do
                    } else if (publicjsList.indexOf(sourceIdentifier) > -1 || publicjsList.indexOf(jspRelativeName) > -1) {
                        log.debug(2);
                        // jsp file is head-content.jsp || includeJS.jsp
                        sourceContent += '\n' + filemapTmpl(gexcludes);
                        // add global deps, add them to filemap.
                        filemap.addAmdDepends(sourceIdentifier, gexcludes);
                    } else if (/^(\S*\/)*mobile\//.test(sourceIdentifier)) {
                        // add global deps for mobile web app
                        sourceContent = sourceContent.replace(/\s*(<script\s*.+>)/g, function (match, target) {
                            if (target.indexOf('data-main') > -1) {
                                return '\n' + target + '\n' + filemapTmpl(nestedCollection, 'mobile') + '\n'; 
                            } else {
                                return target;
                            }
                        });
                    } else {
                        if (headCloseTagExpr.test(sourceContent)) {
                            log.debug(3);
                            headCloseTagExpr.lastIndex = 0;
                            // the page content has </head> closed tag.
                            sourceContent = sourceContent.replace(headCloseTagExpr, filemapTmpl(nestedCollection) + '\n$1');
                        } else if (scriptTagExpr.test(sourceContent)) {
                            log.debug(4);
                            scriptTagExpr.lastIndex = 0;
                            // find <script> start tag in jsp file content at first time, and add file map paths before the script tag.
                            sourceContent = sourceContent.replace(scriptTagExpr, filemapTmpl(nestedCollection) + "$1");
                        }
                    }

                    log.write('result jsp: ' + resultPath.data + ' ...');
                    file.write(resultPath, sourceContent);
                    log.info('ok');
                    setTimeout(recursiveSource, 0);
                }
            })();

        });
    });

};