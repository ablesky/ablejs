/**
 * utils - jsbin.
 */

'use strict';

// node libs.
var path = require("path");

// external libs.
var madge = require('madge'); // https://github.com/pahen/madge
var uglifyJS = require("uglify-js");
var requirejs = require('requirejs');

// internal libs.
var log = require('./log');
var file = require('./file');

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

function compress(src, dest, opts) {
    var contents = file.read(src);

    if (arguments.length === 2) {
        opts = dest;
        dest = src;
    } else if (opts.onBuildRead) {
        contents = opts.onBuildRead(null, null, contents);
    }

    contents = exports.uglify(contents);

    if (opts.banner) {
        contents = opts.banner + contents;
    }

    file.write(dest, contents);
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
                return options.onBuildRead ? options.onBuildRead.apply(this, arguments) : contents;
            },
            onBuildWrite: function(moduleName, path, contents) {
                return options.onBuildWrite ? options.onBuildWrite.apply(this, arguments) : contents;
            },
            onModuleBundleComplete: function(data) {
                compress(resultPath, options);
            }

        }, function success() {
            callback();
        }, function error(e) {
            log.error(e.message);
        });
    } else {
        compress(sourcePath, resultPath, options);
        callback();
    }


};