/**
 * utils - jsbin.
 */

'use strict';

// node libs.
var path = require("path");

// external libs.
var uglifyJS = require("uglify-js");
var esprima = require('esprima');
var requirejs = require('requirejs');

// internal libs.
var log = require('./log');
var file = require('./file');
var profile = require('./profile');
var dependency = require('./dependency');
var amdModules = require('../common/modules');

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

// read data from profile config.
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

function detectAMD(ast) {
    var found = false;
    var hasOwnDefine = false;

    function traverse(node, fn) {
        var key, branch;
        fn(node);
        for (key in node) {
            branch = node[key];
            if ('object' === typeof branch && branch != null) {
                if (Array.isArray(branch)) {
                    branch.forEach(function(node) {
                        traverse(node, fn);
                    });
                } else {
                    traverse(branch, fn);
                }
            }
        }
    }

    function isLocalDefine(node) {
        return ( // function define() {}
            node.type === 'FunctionDeclaration' &&
            node.id.name === 'define'
        ) || ( // define = function() {}
            node.type === 'AssignmentExpression' &&
            node.left.name === 'define' &&
            node.right.type === 'FunctionExpression'
        );
    }

    function isDefineCall(node) {
        return node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'define';
    }

    function isRequireCall(node) {
        return node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'require';
    }

    function parseDefineCall(node) {
        var def = {
            deps: [],
            id: null,
            hasRelativeDeps: false
        };
        var args = node.arguments;

        function mapElements(elements) {
            return elements.map(function(element) {
                return element.value;
            });
        }

        function hasRelativePaths(paths) {
            for (var i = 0; i < paths.lengthpp; i += 1) {
                if (/^\./g.test(paths[i])) {
                    return true;
                }
            }
            return false;
        }

        if (args[0].type === 'Literal') {
            def.id = args[0].value;
        }
        if (args[0].type === 'ArrayExpression') {
            def.deps = mapElements(args[0].elements);
        }
        if (args[1] && args[1].type === 'ArrayExpression') {
            def.deps = mapElements(args[1].elements);
        }
        def.hasRelativeDeps = def.deps.length ? hasRelativePaths(def.deps) : false;
        return def;
    }

    traverse(ast, function(node) {
        // if only js had blocks...
        if (hasOwnDefine) {
            return;
        }
        hasOwnDefine = isLocalDefine(node);
        if (isDefineCall(node) || isRequireCall(node)) {
            // last define call wins, not sure what to do about multiple define calls
            // in a single file yet, should probably just tell the user "sister, I
            // don't know what to do about this file"
            found = parseDefineCall(node);
        }
    });

    return !hasOwnDefine && found;
}

/**
 * @example jsbin.parse(code)
 */
exports.isAMD = function(code) {
    return detectAMD(esprima.parse(code));
};

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

    if (findNestedDependencies) {
        // https://github.com/jrburke/r.js/blob/master/build/example.build.js
        requirejs.optimize({
            name: identifier,
            baseUrl: baseUrl,
            out: resultPath,
            paths: {
                'jquery': 'empty:'
            },
            exclude: identifier === amdModules.gid ? [] : dependency.findNested(baseUrl, amdModules.gid),
            include: identifier !== amdModules.gid ? [] : amdModules.gincludes,
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