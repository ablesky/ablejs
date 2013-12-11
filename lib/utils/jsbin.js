/**
 * utils - jsbin.
 */

'use strict';

// node libs.
var path = require("path");

// external libs.
var uglifyJS = require("uglify-js");
var requirejs = require('requirejs');

// internal libs.
var log = require('./log');
var file = require('./file');
var profile = require('./profile');
var gmodule = require('../common/gmodule');

// requirejs need module "node/print"
requirejs.define('node/print', [], function() {
    return function print(msg) {
        if (msg.substring(0, 5) === 'Error') {
            log.error(msg);
        }
    };
});

/**
 * deep copy
 */
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

var OPTIMIZE_MODULES = [];

profile.getModules().forEach(function(ele, index, array) {
    OPTIMIZE_MODULES.push(ele.name);
});

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

/**
 * @example jsbin.optimize(sourcePath, resultPath, identifier, options, callback)
 */
exports.optimize = function(sourcePath, resultPath, identifier, options, callback) {

    options = options || {};
    var extname = path.extname(sourcePath);
    var baseUrl = sourcePath.replace(new RegExp(identifier + extname + '$'), '');

    var findNestedDependencies = OPTIMIZE_MODULES.indexOf(identifier) > -1 ? true : false;
    var excludes = identifier === gmodule.identifier ? [] : gmodule.nestedDepends(baseUrl);
    var includes = identifier !== gmodule.identifier ? [] : gmodule.includes;

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