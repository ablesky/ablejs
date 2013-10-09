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
var GLOBAL_INCLUDES = [];
var OPTIMIZE_MODULES = [];

file.readJSON('dist/profile.json').modules.forEach(function(ele, index, array) {
    OPTIMIZE_MODULES.push(ele.name);

    if (ele.name === GLOBAL_ID) {
        GLOBAL_INCLUDES = ele.include || [];
    }
});

var globalJSDepends = null;
/**
 * global.js recursive depends
 * @param  {String} src   all js files root dir.
 * @param  {Boolean} nocache
 * @return {Array}       global.js recursive depends also include itself.
 */
function getGlobalJSRecursiveDepends(src, nocache) {
    var dependsTree, dependsArray;

    function getRecursiveDepends(arr) {
        for (var i = 0, j; j = arr[i]; i++) {
            if (globalJSDepends.indexOf(j) === -1) {
                globalJSDepends.push(j);
                getRecursiveDepends(dependsTree[j]);
            }
        }
    }

    if (!globalJSDepends || nocache) {
        globalJSDepends = [];
        dependsTree = madge(src, {
            format: 'amd'
        }).tree;

        dependsArray = dependsTree[GLOBAL_ID];
        getRecursiveDepends(dependsArray);
    }

    return globalJSDepends;
}

function process(src, dest, opts) {
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

    var findNestedDependencies = OPTIMIZE_MODULES.indexOf(identifier) > -1 ? true : false;
    var excludes = identifier === GLOBAL_ID ? [] : getGlobalJSRecursiveDepends(baseUrl);
    var includes = identifier !== GLOBAL_ID ? [] : GLOBAL_INCLUDES;

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
            include: includes,
            packages: [],
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
                process(resultPath, options);
            }

        }, function success() {
            callback();
        }, function error(e) {
            log.error(e.message);
        });
    } else {
        process(sourcePath, resultPath, options);
        callback();
    }


};