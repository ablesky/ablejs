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

/**
 * @example jsbin.optimize(sourcePath, identifier, resultPath, options, callback)
 */
exports.optimize = function(sourcePath, resultPath, identifier, options, callback) {

    var extname = path.extname(sourcePath);
    var baseUrl = sourcePath.replace(new RegExp(identifier + extname + '$'), '');

    // https://github.com/jrburke/r.js/blob/master/build/example.build.js
    requirejs.optimize({
        name: identifier,
        baseUrl: baseUrl,
        out: resultPath,
        paths: {
            'jquery': 'empty:'
        },
        packages: [],
        include: [],
        preserveLicenseComments: false,
        optimize: 'uglify',
        uglify: {
            toplevel: true,
            ascii_only: options.asciiOnly,
            max_line_length: 1000,

            //How to pass uglifyjs defined symbols for AST symbol replacement,
            //see "defines" options for ast_mangle in the uglifys docs.
            defines: {
                DEBUG: ['name', 'false']
            },

            // Custom value supported by r.js but done differently
            // in uglifyjs directly:
            // Skip the processor.ast_mangle() part of the uglify call (r.js 2.0.5+)
            no_mangle: true
        },
        findNestedDependencies: true,
        onBuildWrite: function(moduleName, path, contents) {
            if (options.banner) {
                contents = options.banner + contents;
            }

            return contents;
        }

        // dir: '<%= pkg.config.dest_js %>',
        // useStrict: true,
        // useSourceUrl: false,
        // optimize: 'none',
        // generateSourceMaps: false,
        // preserveLicenseComments: false,
        // keepBuildDir: true,
        // skipDirOptimize: true,
        // optimizeAllPluginResources: false,
        // findNestedDependencies: true,
        // modules: profile.modules,

    }, function success() {
        // compress file content.
        // minified = jsbin.uglify(sourceContent, {
        //     relativeTo: path.dirname(sourcePath) // to resolve relative @import rules
        // });
        // file.write(resultPath, minified);

        log.info('result js: ' + resultPath.yellow + '\n');
        callback();
    }, function error(e) {
        log.error(e.message);
    });

};