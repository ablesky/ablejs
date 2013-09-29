/**
 * utils - jsbin.
 */

'use strict';

// external libs.
var uglifyJS = require("uglify-js");

// internal libs.
var log = require('./log');

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