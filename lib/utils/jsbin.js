/**
 * utils - jsbin.
 */

'use strict';

// node libs.
var path = require("path");
var fs = require("fs");

// external libs.
var madge = require('madge'); // https://github.com/pahen/madge
var uglifyJS = require("uglify-js");
var requirejs = require('requirejs');

// internal libs.
var log = require('./log');

// requirejs need module "node/print"
requirejs.define('node/print', [], function() {
    return function print(msg) {
        if (msg.substring(0, 5) === 'Error') {
            log.error(msg);
        }
    };
});

function mixin(target, source, force, deepStringMixin) {
    function hasProp(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    if (source) {
        eachProp(source, function(value, prop) {
            if (force || !hasProp(target, prop)) {
                if (deepStringMixin && typeof value !== 'string') {
                    if (!target[prop]) {
                        target[prop] = {};
                    }
                    mixin(target[prop], value, force, deepStringMixin);
                } else {
                    target[prop] = value;
                }
            }
        });
    }
    return target;
}

/**
 * @example jsbin.uglify(source, options)
 */
exports.uglify = function(source, options) {
    options = mixin({
        compress: {
            warnings: false,
            global_defs: {
                "DEBUG": false
            },
            drop_debugger: true,
            dead_code: true
        },
        mangle: {},
        beautify: false,
        report: false,
        fromString: true
    }, (options || {}));

    try {
        return uglifyJS.minify(source, options).code;
    } catch (e) {
        log.error(e);
    }
};


var GLOBAL_ID = 'common/global';
var dependencyTree, requirejsExcludes = null;
function getRecursiveDepends(arr) {
    for (var i = 0, j; j = arr[i]; i++) {
        if (requirejsExcludes.indexOf(j) === -1) {
            requirejsExcludes.push(j);
            getRecursiveDepends(dependencyTree[j]);
        }
    }
}

function getRequireJSExcludes(src) {
    var dependencyArray;
    if (!requirejsExcludes) {
        requirejsExcludes = [];
        dependencyTree = madge(src, {
            format: 'amd'
        }).tree;

        dependencyArray = dependencyTree[GLOBAL_ID];
        getRecursiveDepends(dependencyArray);
    }

    return requirejsExcludes;
}

/**
 * @example jsbin.optimize(sourcePath, resultPath, identifier, options, callback)
 */
exports.optimize = function(sourcePath, resultPath, identifier, options, callback) {

    options = options || {};
    var extname = path.extname(sourcePath);
    var baseUrl = sourcePath.replace(new RegExp(identifier + extname + '$'), '');

    var excludes = identifier === GLOBAL_ID ? [] : getRequireJSExcludes(baseUrl);
    var findNestedDependencies = identifier === GLOBAL_ID ? true : false;

    function compress(src, dest) {
        var contents = fs.readFileSync(src, 'utf8');

        if (arguments.length === 1) {
            dest = src;
        } else {
            contents = options.onBuildRead(null, null, contents);
        }
        
        contents = exports.uglify(contents);

        if (options.banner) {
            contents = options.banner + contents;
        }

        fs.writeFileSync(dest, contents, 'utf8');
    }

    if (findNestedDependencies) {
        // https://github.com/jrburke/r.js/blob/master/build/example.build.js
        requirejs.optimize({
            name: identifier,
            baseUrl: baseUrl,
            out: resultPath,
            paths: {
                'jquery': 'empty:'
            },
            exclude: excludes,
            packages: [],
            include: [],
            preserveLicenseComments: false,
            optimize: 'none',
            findNestedDependencies: findNestedDependencies,
            onBuildRead: function(moduleName, path, contents) {
                if (options.onBuildRead) {
                    contents = options.onBuildRead.apply(this, arguments);
                }

                return contents;
            },
            onBuildWrite: function(moduleName, path, contents) {
                if (options.onBuildWrite) {
                    contents = options.onBuildWrite.apply(this, arguments);
                }

                return contents;
            },
            onModuleBundleComplete: function(data) {
                compress(resultPath);
            }

            // dir: '<%= pkg.config.dest_js %>',
            // useStrict: true,
            // useSourceUrl: false,
            // optimize: 'none',
            // generateSourceMaps: false,
            // keepBuildDir: true,
            // skipDirOptimize: true,
            // optimizeAllPluginResources: false,
            // modules: profile.modules,

        }, function success() {
            callback();
        }, function error(e) {
            log.error(e.message);
        });
    } else {
        compress(sourcePath, resultPath);
        callback();
    }


};